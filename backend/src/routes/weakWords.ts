import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// Common English connector words to weave weak words naturally
const CONNECTOR_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also'
];

// Templates for sentence mode injection
const SENTENCE_TEMPLATES = [
  "It is {w1} to understand that {w2} plays an essential role in this process.",
  "We must make sure that {w1} does not compromise the overall {w2} of our workflow.",
  "The team worked hard to improve {w1} while maintaining strict focus on {w2}.",
  "With proper {w1} and careful attention, you will quickly master {w2}.",
  "A solid understanding of {w1} will definitely help you navigate {w2} with ease.",
  "When you practice {w1} consistently, you build great speed and control over {w2}.",
  "Every single developer should know {w1} before attempting to build complex {w2}.",
  "The primary goal of practicing {w1} is to overcome repetitive errors in {w2}.",
  "Notice how smoothly {w1} flows once you eliminate hesitation around {w2}.",
  "Regular repetition of {w1} makes it feel natural alongside {w2}."
];

// GET /api/weak-words
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const filter = (req.query.filter as string) || 'all'; // all, weak, needs_improvement, strong, top10, most_mistakes
    const search = ((req.query.search as string) || '').toLowerCase().trim();
    const sortBy = (req.query.sortBy as string) || 'errorRate'; // errorRate, mistakes, attempts, avgTime, word
    const order = (req.query.order as string) === 'asc' ? 'asc' : 'desc';

    const words = await prisma.wordStatistic.findMany({
      where: {
        userId,
        ...(search ? { word: { contains: search } } : {}),
      },
    });

    // Tag status: red (weak >25%), yellow (needs improvement 10-25%), green (strong <10%)
    const processedWords = words.map((w) => {
      let status: 'weak' | 'needs_improvement' | 'strong';
      if (w.errorRate > 25) {
        status = 'weak';
      } else if (w.errorRate >= 10) {
        status = 'needs_improvement';
      } else {
        status = 'strong';
      }
      return {
        ...w,
        status,
      };
    });

    // Categorized breakdown counts
    const counts = {
      total: processedWords.length,
      weak: processedWords.filter((w) => w.status === 'weak').length,
      needsImprovement: processedWords.filter((w) => w.status === 'needs_improvement').length,
      strong: processedWords.filter((w) => w.status === 'strong').length,
    };

    // Filter logic
    let filtered = [...processedWords];
    if (filter === 'weak') {
      filtered = filtered.filter((w) => w.status === 'weak');
    } else if (filter === 'needs_improvement') {
      filtered = filtered.filter((w) => w.status === 'needs_improvement');
    } else if (filter === 'strong') {
      filtered = filtered.filter((w) => w.status === 'strong');
    } else if (filter === 'top10') {
      filtered.sort((a, b) => b.errorRate - a.errorRate || b.mistakes - a.mistakes);
      filtered = filtered.slice(0, 10);
    } else if (filter === 'most_mistakes') {
      filtered.sort((a, b) => b.mistakes - a.mistakes || b.errorRate - a.errorRate);
    }

    // Sort if not top10 (which is pre-sorted)
    if (filter !== 'top10') {
      filtered.sort((a: any, b: any) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (typeof valA === 'string') {
          return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return order === 'asc' ? valA - valB : valB - valA;
      });
    }

    res.json({
      words: filtered,
      counts,
      top10: [...processedWords]
        .sort((a, b) => b.errorRate - a.errorRate || b.mistakes - a.mistakes)
        .slice(0, 10),
      mostMistyped: [...processedWords]
        .sort((a, b) => b.mistakes - a.mistakes)
        .slice(0, 10),
    });
  } catch (error) {
    console.error('Error fetching weak words:', error);
    res.status(500).json({ error: 'Failed to retrieve weak words' });
  }
});

// GET /api/weak-words/targeted-test
router.get('/targeted-test', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const countOption = (req.query.countOption as string) || '10'; // '5', '10', '20', 'all'
    const mode = (req.query.mode as string) || 'words'; // 'words' | 'sentence'
    const targetWordCount = Math.min(100, Math.max(10, parseInt(req.query.targetWordCount as string) || 30));

    // Get weakest words sorted by errorRate and mistakes
    const weakWordsRecords = await prisma.wordStatistic.findMany({
      where: {
        userId,
        mistakes: { gt: 0 },
      },
      orderBy: [
        { errorRate: 'desc' },
        { mistakes: 'desc' },
      ],
    });

    let selectedWords = weakWordsRecords;
    if (countOption === '5') {
      selectedWords = selectedWords.slice(0, 5);
    } else if (countOption === '10') {
      selectedWords = selectedWords.slice(0, 10);
    } else if (countOption === '20') {
      selectedWords = selectedWords.slice(0, 20);
    }

    // Fallback if user doesn't have enough weak words yet
    if (selectedWords.length === 0) {
      const fallbackWords = ['definitely', 'rhythm', 'necessary', 'maintenance', 'environment', 'hierarchy', 'conscious', 'accommodate'];
      selectedWords = fallbackWords.map((w, idx) => ({
        id: `mock-${idx}`,
        userId,
        word: w,
        attempts: 5,
        mistakes: 3,
        errorRate: 60,
        averageTypingTime: 800,
        lastPracticed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }

    const wordList = selectedWords.map((w) => w.word);

    let generatedText = '';

    if (mode === 'sentence') {
      // Generate realistic sentences embedding weak words
      const sentences: string[] = [];
      let totalWords = 0;
      let templateIdx = 0;

      while (totalWords < targetWordCount) {
        const w1 = wordList[Math.floor(Math.random() * wordList.length)];
        let w2 = wordList[Math.floor(Math.random() * wordList.length)];
        if (wordList.length > 1) {
          while (w2 === w1) {
            w2 = wordList[Math.floor(Math.random() * wordList.length)];
          }
        }
        const template = SENTENCE_TEMPLATES[templateIdx % SENTENCE_TEMPLATES.length];
        templateIdx++;

        const sentence = template.replace('{w1}', w1).replace('{w2}', w2);
        sentences.push(sentence);
        totalWords += sentence.split(/\s+/).length;
      }
      generatedText = sentences.join(' ');
    } else {
      // Individual words mode:
      // High-frequency repetition of weak words (approx 65% weak words, 35% natural connector words)
      const wordsArray: string[] = [];
      while (wordsArray.length < targetWordCount) {
        const pickWeak = Math.random() < 0.65;
        if (pickWeak) {
          // Weight towards the top weakest words
          const index = Math.floor(Math.pow(Math.random(), 1.5) * wordList.length);
          wordsArray.push(wordList[index]);
        } else {
          const connector = CONNECTOR_WORDS[Math.floor(Math.random() * CONNECTOR_WORDS.length)];
          wordsArray.push(connector);
        }
      }
      generatedText = wordsArray.join(' ');
    }

    res.json({
      text: generatedText,
      targetedWords: selectedWords.map((w) => ({
        word: w.word,
        errorRate: w.errorRate,
        mistakes: w.mistakes,
        attempts: w.attempts,
      })),
      mode,
      targetWordCount,
    });
  } catch (error) {
    console.error('Error generating targeted test:', error);
    res.status(500).json({ error: 'Failed to generate targeted practice test' });
  }
});

// POST /api/weak-words/custom-test
router.post('/custom-test', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { words = [], rawText = '', count = 30, mode = 'words' } = req.body;

    let wordList: string[] = [];

    if (rawText && typeof rawText === 'string') {
      wordList = rawText
        .split(/[\s,\n]+/)
        .map((w) => w.toLowerCase().replace(/[^a-z0-9'-]/g, '').trim())
        .filter((w) => w.length > 0);
    } else if (Array.isArray(words)) {
      wordList = words
        .map((w) => String(w).toLowerCase().replace(/[^a-z0-9'-]/g, '').trim())
        .filter((w) => w.length > 0);
    }

    if (wordList.length === 0) {
      res.status(400).json({ error: 'Please provide at least one valid word' });
      return;
    }

    const targetCount = Math.min(100, Math.max(5, Number(count) || 30));
    const resultWords: string[] = [];

    if (mode === 'sentence') {
      const sentences: string[] = [];
      let totalWords = 0;
      let templateIdx = 0;

      while (totalWords < targetCount) {
        const w1 = wordList[Math.floor(Math.random() * wordList.length)];
        const w2 = wordList[Math.floor(Math.random() * wordList.length)];
        const template = SENTENCE_TEMPLATES[templateIdx % SENTENCE_TEMPLATES.length];
        templateIdx++;

        const sentence = template.replace('{w1}', w1).replace('{w2}', w2);
        sentences.push(sentence);
        totalWords += sentence.split(/\s+/).length;
      }
      res.json({
        text: sentences.join(' '),
        words: wordList,
      });
      return;
    }

    while (resultWords.length < targetCount) {
      const pickCustom = Math.random() < 0.7;
      if (pickCustom || wordList.length >= targetCount) {
        const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
        resultWords.push(randomWord);
      } else {
        const connector = CONNECTOR_WORDS[Math.floor(Math.random() * CONNECTOR_WORDS.length)];
        resultWords.push(connector);
      }
    }

    res.json({
      text: resultWords.join(' '),
      words: wordList,
    });
  } catch (error) {
    console.error('Error generating custom test:', error);
    res.status(500).json({ error: 'Failed to generate custom test' });
  }
});

export default router;

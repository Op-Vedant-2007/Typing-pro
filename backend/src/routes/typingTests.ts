import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// POST /api/typing-tests
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const {
      mode = 'time',
      duration = 30,
      wordCount = 0,
      wpm = 0,
      rawWpm = 0,
      accuracy = 100,
      correctCharacters = 0,
      incorrectCharacters = 0,
      totalCharacters = 0,
      practiceTime = 30,
      consistency = 0,
      wordsData = [],
      timelineData = [],
    } = req.body;

    // Check personal best
    const prevBest = await prisma.typingTest.findFirst({
      where: {
        userId,
        mode,
        duration: Math.round(duration),
      },
      orderBy: { wpm: 'desc' },
    });

    const isPersonalBest = !prevBest || wpm > prevBest.wpm;

    // 1. Save typing test
    const typingTest = await prisma.typingTest.create({
      data: {
        userId,
        mode: String(mode),
        duration: Math.round(duration),
        wordCount: Math.round(wordCount),
        wpm: Number(wpm.toFixed(1)),
        rawWpm: Number(rawWpm.toFixed(1)),
        accuracy: Number(accuracy.toFixed(1)),
        correctCharacters: Math.round(correctCharacters),
        incorrectCharacters: Math.round(incorrectCharacters),
        totalCharacters: Math.round(totalCharacters),
        practiceTime: Math.round(practiceTime),
        consistency: Number(consistency.toFixed(1)),
        wordsData: JSON.stringify(wordsData),
        timelineData: JSON.stringify(timelineData),
      },
    });

    // 2. Update daily activity
    const today = new Date().toISOString().split('T')[0];
    const existingDaily = await prisma.dailyActivity.findUnique({
      where: {
        userId_activityDate: {
          userId,
          activityDate: today,
        },
      },
    });

    if (existingDaily) {
      const newTotalTests = existingDaily.testsCompleted + 1;
      const newAvgWpm = Number(
        ((existingDaily.avgWpm * existingDaily.testsCompleted + wpm) / newTotalTests).toFixed(1)
      );

      await prisma.dailyActivity.update({
        where: { id: existingDaily.id },
        data: {
          practiceSeconds: existingDaily.practiceSeconds + Math.round(practiceTime),
          testsCompleted: newTotalTests,
          wordsTyped: existingDaily.wordsTyped + Math.round(wordCount),
          avgWpm: newAvgWpm,
        },
      });
    } else {
      await prisma.dailyActivity.create({
        data: {
          userId,
          activityDate: today,
          practiceSeconds: Math.round(practiceTime),
          testsCompleted: 1,
          wordsTyped: Math.round(wordCount),
          avgWpm: Number(wpm.toFixed(1)),
        },
      });
    }

    // 3. Process Weak Words
    if (Array.isArray(wordsData) && wordsData.length > 0) {
      for (const item of wordsData) {
        if (!item || !item.word) continue;
        const cleanWord = item.word.toLowerCase().replace(/[^a-z0-9'-]/g, '').trim();
        if (cleanWord.length < 2) continue;

        const hasMistake = Boolean(item.mistakes > 0 || item.isMistake);
        const durationMs = Math.max(100, Math.min(10000, Number(item.durationMs || 500)));

        const existingWord = await prisma.wordStatistic.findUnique({
          where: {
            userId_word: {
              userId,
              word: cleanWord,
            },
          },
        });

        if (existingWord) {
          const attempts = existingWord.attempts + 1;
          const mistakes = existingWord.mistakes + (hasMistake ? 1 : 0);
          const errorRate = Number(((mistakes / attempts) * 100).toFixed(1));
          const averageTypingTime = Number(
            ((existingWord.averageTypingTime * existingWord.attempts + durationMs) / attempts).toFixed(0)
          );

          await prisma.wordStatistic.update({
            where: { id: existingWord.id },
            data: {
              attempts,
              mistakes,
              errorRate,
              averageTypingTime,
              lastPracticed: new Date(),
            },
          });
        } else {
          await prisma.wordStatistic.create({
            data: {
              userId,
              word: cleanWord,
              attempts: 1,
              mistakes: hasMistake ? 1 : 0,
              errorRate: hasMistake ? 100.0 : 0.0,
              averageTypingTime: durationMs,
              lastPracticed: new Date(),
            },
          });
        }
      }
    }

    res.status(201).json({
      test: typingTest,
      isPersonalBest,
      previousBestWpm: prevBest ? prevBest.wpm : null,
    });
  } catch (error) {
    console.error('Error saving typing test:', error);
    res.status(500).json({ error: 'Failed to record typing test' });
  }
});

// GET /api/typing-tests/history
router.get('/history', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 15));
    const mode = req.query.mode as string | undefined;

    const where: any = { userId };
    if (mode && mode !== 'all') {
      where.mode = mode;
    }

    const [tests, total] = await Promise.all([
      prisma.typingTest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.typingTest.count({ where }),
    ]);

    res.json({
      tests,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching typing history:', error);
    res.status(500).json({ error: 'Failed to fetch typing history' });
  }
});

// GET /api/typing-tests/summary
router.get('/summary', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const [tests, bestTest, activities] = await Promise.all([
      prisma.typingTest.findMany({
        where: { userId },
        select: {
          wpm: true,
          accuracy: true,
          practiceTime: true,
          wordCount: true,
          createdAt: true,
        },
      }),
      prisma.typingTest.findFirst({
        where: { userId },
        orderBy: { wpm: 'desc' },
      }),
      prisma.dailyActivity.findMany({
        where: { userId },
        orderBy: { activityDate: 'asc' },
        select: {
          activityDate: true,
          practiceSeconds: true,
          testsCompleted: true,
        },
      }),
    ]);

    const totalTests = tests.length;
    const totalPracticeSeconds = tests.reduce((acc, t) => acc + t.practiceTime, 0);
    const totalWordsTyped = tests.reduce((acc, t) => acc + t.wordCount, 0);

    const avgWpm =
      totalTests > 0
        ? Number((tests.reduce((acc, t) => acc + t.wpm, 0) / totalTests).toFixed(1))
        : 0;

    const avgAccuracy =
      totalTests > 0
        ? Number((tests.reduce((acc, t) => acc + t.accuracy, 0) / totalTests).toFixed(1))
        : 0;

    const highestWpm = bestTest ? bestTest.wpm : 0;

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (activities.length > 0) {
      const activityDates = new Set(activities.map((a) => a.activityDate));
      const sortedDates = Array.from(activityDates).sort();

      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const prev = new Date(sortedDates[i - 1]);
          const curr = new Date(sortedDates[i]);
          const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            tempStreak += 1;
          } else {
            tempStreak = 1;
          }
        }
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      }

      // Check current streak from today or yesterday
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (activityDates.has(today) || activityDates.has(yesterday)) {
        let checkDate = activityDates.has(today) ? new Date() : new Date(Date.now() - 86400000);
        while (true) {
          const dStr = checkDate.toISOString().split('T')[0];
          if (activityDates.has(dStr)) {
            currentStreak += 1;
            checkDate = new Date(checkDate.getTime() - 86400000);
          } else {
            break;
          }
        }
      }
    }

    res.json({
      totalTests,
      totalPracticeSeconds,
      totalWordsTyped,
      avgWpm,
      highestWpm,
      avgAccuracy,
      currentStreak,
      longestStreak,
    });
  } catch (error) {
    console.error('Error fetching summary statistics:', error);
    res.status(500).json({ error: 'Failed to fetch summary statistics' });
  }
});

export default router;

// Curated word banks, quotes, and sentence generators for TypeFlow (Monkeytype compatible)

export const WORDS_COMMON = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you",
  "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one",
  "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when",
  "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some",
  "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back",
  "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these",
  "give", "day", "most", "us", "write", "great", "tell", "much", "world", "own", "life", "never", "high",
  "call", "hand", "place", "hold", "system", "right", "program", "feel", "number", "point", "next", "open", "turn",
  "run", "move", "need", "problem", "flow", "type", "fast", "speed", "focus", "clean", "code", "light", "dark", "mind",
  "learn", "build", "create", "drive", "power", "skill", "quick", "space", "form", "group", "lead", "start", "read",
  "show", "hear", "play", "small", "end", "begin", "while", "last", "might", "sound", "still", "between", "both", "under",
  "same", "another", "where", "water", "found", "order", "state", "keep", "eye", "never", "last", "thought", "city",
  "tree", "cross", "farm", "hard", "start", "might", "story", "saw", "far", "sea", "draw", "left", "late", "run",
  "press", "close", "night", "real", "life", "few", "north", "book", "carry", "took", "science", "eat", "room", "friend",
  "began", "idea", "fish", "mountain", "stop", "once", "base", "hear", "horse", "cut", "sure", "watch", "color", "face",
  "wood", "main", "open", "seem", "together", "next", "white", "children", "begin", "got", "walk", "example", "ease",
  "paper", "group", "always", "music", "those", "both", "mark", "often", "letter", "until", "mile", "river", "car", "feet",
  "care", "second", "book", "carry", "took", "rain", "eat", "room", "friend", "began", "idea", "fish", "mountain"
];

export const WORDS_EXTENDED = [
  "algorithm", "function", "variable", "structure", "interface", "developer", "terminal", "component", "render",
  "database", "asynchronous", "performance", "optimization", "framework", "application", "frequency", "consistency",
  "knowledge", "experience", "discipline", "challenge", "milestone", "efficiency", "precision", "intelligence",
  "architecture", "responsive", "execution", "synchronous", "dependency", "parameter", "iteration", "production",
  "environment", "maintenance", "hierarchy", "millennium", "occurrence", "independent", "guarantee", "definitely",
  "rhythm", "necessary", "bureaucracy", "fluorescent", "conscious", "pseudocode", "accommodate", "privilege", "embarrass"
];

export const QUOTES = [
  {
    text: "Simplicity is prerequisite for reliability. The key to building robust systems is finding the cleanest path through complexity.",
    author: "Edsger W. Dijkstra"
  },
  {
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler"
  },
  {
    text: "First, solve the problem. Then, write the code. When focus meets persistent practice, mastery naturally follows.",
    author: "John Johnson"
  },
  {
    text: "Typing is not merely hitting keys; it is the direct translation of thought into action without conscious mechanical friction.",
    author: "TypeFlow Philosophy"
  },
  {
    text: "Experience is the name everyone gives to their mistakes. Continuous typing drills reveal subtle habits that can be polished.",
    author: "Oscar Wilde"
  },
  {
    text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.",
    author: "Antoine de Saint-Exupéry"
  },
  {
    text: "The secret of getting ahead is getting started. Break your complex typing goals into small manageable daily milestones.",
    author: "Mark Twain"
  },
  {
    text: "Talk is cheap. Show me the code. Build muscle memory through disciplined repetition and steady incremental speed.",
    author: "Linus Torvalds"
  }
];

export const SENTENCES = [
  "Consistent practice each morning builds muscle memory faster than sporadic marathon sessions.",
  "When you focus on absolute precision first, high typing speed becomes a natural byproduct.",
  "Developing fluid rhythm across the keyboard eliminates hesitation between common character pairings.",
  "Every keystroke is an opportunity to refine posture, hand position, and relaxed finger control.",
  "Identify your weakest words and drill them intentionally until every syllable feels effortless.",
  "Smooth pacing consistently outperforms erratic bursts of speed that result in frequent backspaces.",
  "Clean software architecture and fluid typing share the same virtue: removing unnecessary friction.",
  "Notice how your accuracy stabilizes when you glance ahead to the upcoming word while finishing the current one."
];

export function getRandomWords(count: number, punctuation: boolean = false, numbers: boolean = false): string[] {
  const pool = [...WORDS_COMMON, ...WORDS_EXTENDED];
  const words: string[] = [];

  for (let i = 0; i < count; i++) {
    let word = pool[Math.floor(Math.random() * pool.length)];

    if (numbers && Math.random() < 0.12) {
      word = String(Math.floor(Math.random() * 900) + 10);
    }

    if (punctuation && Math.random() < 0.15) {
      const marks = [',', '.', '!', '?', ';', '-'];
      const mark = marks[Math.floor(Math.random() * marks.length)];
      word = word + mark;
    }

    words.push(word);
  }

  return words;
}

interface GeneratorOptions {
  mode: 'time' | 'words' | 'quote' | 'sentence' | 'custom' | 'weak_words' | 'zen';
  wordCount?: number;
  punctuation?: boolean;
  numbers?: boolean;
  customText?: string;
}

export function generateTestText(options: GeneratorOptions): { text: string; quoteInfo?: { author: string } } {
  const { mode, wordCount = 25, punctuation = false, numbers = false, customText = '' } = options;

  if (mode === 'custom' && customText.trim()) {
    return { text: customText.trim() };
  }

  if (mode === 'quote') {
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    return { text: randomQuote.text, quoteInfo: { author: randomQuote.author } };
  }

  if (mode === 'sentence') {
    const shuffled = [...SENTENCES].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(3, Math.max(1, Math.round(wordCount / 15))));
    return { text: selected.join(' ') };
  }

  // In time or zen mode: provide 250 words initially so text never exhausts!
  const count = mode === 'time' || mode === 'zen' ? 250 : Math.max(10, wordCount);
  const words = getRandomWords(count, punctuation, numbers);

  return { text: words.join(' ') };
}

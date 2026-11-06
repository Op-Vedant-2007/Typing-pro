export type TestMode = 'time' | 'words' | 'quote' | 'sentence' | 'custom' | 'weak_words' | 'zen';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: string;
  soundEnabled: boolean;
  soundTheme: string; // 'mechanical' | 'typewriter' | 'pop' | 'mute'
  fontSize: string; // 'small' | 'medium' | 'large' | 'xlarge'
  fontFamily: string;
  caretStyle: string; // 'line' | 'block' | 'underline' | 'outline'
  preferredTestDuration: number;
  preferredWordCount: number;
  preferredMode: string;
  preferredLanguage?: string;
  punctuation: boolean;
  numbers: boolean;
}

export interface WordPerformance {
  word: string;
  typed: string;
  mistakes: number;
  isMistake: boolean;
  durationMs: number;
}

export interface TimelinePoint {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

export interface TypingTestResult {
  id?: string;
  userId?: string;
  mode: TestMode;
  duration: number;
  wordCount: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctCharacters: number;
  incorrectCharacters: number;
  totalCharacters: number;
  practiceTime: number;
  consistency: number;
  wordsData: WordPerformance[];
  timelineData: TimelinePoint[];
  isPersonalBest?: boolean;
  previousBestWpm?: number | null;
  createdAt?: string;
}

export interface WordStatistic {
  id: string;
  userId: string;
  word: string;
  attempts: number;
  mistakes: number;
  errorRate: number;
  averageTypingTime: number;
  lastPracticed: string;
  status: 'weak' | 'needs_improvement' | 'strong';
  createdAt: string;
  updatedAt: string;
}

export interface DailyActivity {
  id: string;
  userId: string;
  activityDate: string;
  practiceSeconds: number;
  testsCompleted: number;
  wordsTyped: number;
  avgWpm: number;
}

export interface HeatmapDay {
  date: string;
  dayOfWeek: number;
  seconds: number;
  minutes: number;
  tests: number;
  words: number;
  avgWpm: number;
  level: number; // 0 to 4
}

export interface UserSummary {
  totalTests: number;
  totalPracticeSeconds: number;
  totalWordsTyped: number;
  avgWpm: number;
  highestWpm: number;
  avgAccuracy: number;
  currentStreak: number;
  longestStreak: number;
}

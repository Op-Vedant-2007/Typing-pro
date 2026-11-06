import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';

export async function ensureDemoUser(): Promise<any> {
  const demoEmail = 'demo@typeflow.app';
  let demoUser = await prisma.user.findUnique({
    where: { email: demoEmail },
    include: { userSettings: true },
  });

  if (demoUser) {
    return demoUser;
  }

  const passwordHash = await bcrypt.hash('demo123456', 10);

  // Create demo user with settings
  demoUser = await prisma.user.create({
    data: {
      name: 'Demo Flow',
      email: demoEmail,
      passwordHash,
      userSettings: {
        create: {
          theme: 'typeflow-dark',
          soundEnabled: true,
          soundTheme: 'mechanical',
          fontSize: 'medium',
          fontFamily: 'JetBrains Mono',
          caretStyle: 'line',
          preferredTestDuration: 30,
          preferredWordCount: 25,
          preferredMode: 'time',
          punctuation: false,
          numbers: false,
        },
      },
    },
    include: { userSettings: true },
  });

  // Seed realistic Weak Words
  const sampleWords = [
    { word: 'definitely', attempts: 48, mistakes: 19, avgTime: 820 },
    { word: 'rhythm', attempts: 35, mistakes: 14, avgTime: 790 },
    { word: 'necessary', attempts: 52, mistakes: 18, avgTime: 850 },
    { word: 'bureaucracy', attempts: 24, mistakes: 11, avgTime: 1100 },
    { word: 'fluorescent', attempts: 20, mistakes: 9, avgTime: 1050 },
    { word: 'conscious', attempts: 38, mistakes: 13, avgTime: 920 },
    { word: 'pseudocode', attempts: 30, mistakes: 10, avgTime: 950 },
    { word: 'accommodate', attempts: 42, mistakes: 14, avgTime: 880 },
    { word: 'privilege', attempts: 34, mistakes: 10, avgTime: 810 },
    { word: 'embarrass', attempts: 28, mistakes: 8, avgTime: 760 },
    { word: 'environment', attempts: 65, mistakes: 14, avgTime: 700 },
    { word: 'maintenance', attempts: 40, mistakes: 8, avgTime: 720 },
    { word: 'hierarchy', attempts: 32, mistakes: 6, avgTime: 780 },
    { word: 'millennium', attempts: 26, mistakes: 5, avgTime: 750 },
    { word: 'occurrence', attempts: 35, mistakes: 6, avgTime: 690 },
    { word: 'independent', attempts: 50, mistakes: 7, avgTime: 640 },
    { word: 'guarantee', attempts: 44, mistakes: 6, avgTime: 680 },
    { word: 'function', attempts: 110, mistakes: 4, avgTime: 420 },
    { word: 'variable', attempts: 95, mistakes: 3, avgTime: 430 },
    { word: 'developer', attempts: 85, mistakes: 4, avgTime: 460 },
    { word: 'keyboard', attempts: 90, mistakes: 3, avgTime: 410 },
    { word: 'practice', attempts: 120, mistakes: 5, avgTime: 400 },
    { word: 'system', attempts: 130, mistakes: 3, avgTime: 380 },
    { word: 'program', attempts: 105, mistakes: 4, avgTime: 410 },
    { word: 'interface', attempts: 88, mistakes: 3, avgTime: 450 },
    { word: 'design', attempts: 95, mistakes: 2, avgTime: 390 },
    { word: 'algorithm', attempts: 70, mistakes: 7, avgTime: 590 },
    { word: 'asynchronous', attempts: 45, mistakes: 8, avgTime: 830 },
    { word: 'component', attempts: 82, mistakes: 4, avgTime: 470 },
    { word: 'repository', attempts: 60, mistakes: 5, avgTime: 520 },
  ];

  for (const w of sampleWords) {
    const errorRate = Number(((w.mistakes / w.attempts) * 100).toFixed(1));
    await prisma.wordStatistic.create({
      data: {
        userId: demoUser.id,
        word: w.word,
        attempts: w.attempts,
        mistakes: w.mistakes,
        errorRate,
        averageTypingTime: w.avgTime,
        lastPracticed: new Date(Date.now() - Math.floor(Math.random() * 7 * 86400000)),
      },
    });
  }

  // Seed 60+ typing tests across the past 90 days with progressive WPM growth
  const now = new Date();
  const testBatch = [];
  const dailyMap = new Map<string, { seconds: number; tests: number; words: number; wpms: number[] }>();

  // Base starting speed 52 WPM, growing to ~84 WPM
  for (let i = 90; i >= 0; i--) {
    // 70% chance of practice on any given day to create realistic streak
    if (Math.random() > 0.28 || i < 7) {
      const dayDate = new Date(now.getTime() - i * 86400000);
      const isoDate = dayDate.toISOString().split('T')[0];
      const testsCount = Math.floor(Math.random() * 4) + 1;

      // Progress factor from 0.0 to 1.0
      const progress = (90 - i) / 90;
      const baseWpm = 52 + progress * 28 + (Math.random() * 12 - 6);

      for (let t = 0; t < testsCount; t++) {
        const duration = [15, 30, 60][Math.floor(Math.random() * 3)];
        const testWpm = Number((baseWpm + (Math.random() * 8 - 4)).toFixed(1));
        const rawWpm = Number((testWpm + Math.random() * 5).toFixed(1));
        const accuracy = Number((93 + Math.random() * 6).toFixed(1));
        const totalChars = Math.round((rawWpm * 5 * duration) / 60);
        const correctChars = Math.round((totalChars * accuracy) / 100);
        const incorrectChars = totalChars - correctChars;
        const wordCount = Math.round(totalChars / 5);
        const consistency = Number((75 + Math.random() * 20).toFixed(1));

        const testDate = new Date(dayDate.getTime() + (t * 300000 + Math.random() * 60000));

        testBatch.push({
          userId: demoUser.id,
          mode: duration === 60 ? 'time' : 'time',
          duration,
          wordCount,
          wpm: testWpm,
          rawWpm,
          accuracy,
          correctCharacters: correctChars,
          incorrectCharacters: incorrectChars,
          totalCharacters: totalChars,
          practiceTime: duration,
          consistency,
          createdAt: testDate,
        });

        // Accumulate daily
        if (!dailyMap.has(isoDate)) {
          dailyMap.set(isoDate, { seconds: 0, tests: 0, words: 0, wpms: [] });
        }
        const d = dailyMap.get(isoDate)!;
        d.seconds += duration;
        d.tests += 1;
        d.words += wordCount;
        d.wpms.push(testWpm);
      }
    }
  }

  // Insert tests in chunks
  for (const t of testBatch) {
    await prisma.typingTest.create({ data: t });
  }

  // Insert daily activities
  for (const [dateStr, data] of dailyMap.entries()) {
    const avgWpm = Number((data.wpms.reduce((a, b) => a + b, 0) / data.wpms.length).toFixed(1));
    await prisma.dailyActivity.create({
      data: {
        userId: demoUser.id,
        activityDate: dateStr,
        practiceSeconds: data.seconds,
        testsCompleted: data.tests,
        wordsTyped: data.words,
        avgWpm,
      },
    });
  }

  return demoUser;
}

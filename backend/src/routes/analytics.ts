import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// GET /api/analytics/heatmap
// Returns 365 days of activity data for GitHub-style heatmap
router.get('/heatmap', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 86400000);
    const startDateStr = oneYearAgo.toISOString().split('T')[0];

    const activities = await prisma.dailyActivity.findMany({
      where: {
        userId,
        activityDate: {
          gte: startDateStr,
        },
      },
      orderBy: { activityDate: 'asc' },
    });

    const activityMap = new Map<string, { seconds: number; tests: number; words: number; avgWpm: number }>();
    activities.forEach((act) => {
      activityMap.set(act.activityDate, {
        seconds: act.practiceSeconds,
        tests: act.testsCompleted,
        words: act.wordsTyped,
        avgWpm: act.avgWpm,
      });
    });

    // Generate exact full continuous 365-day array so client can render standard 52-week calendar grid
    const daysData = [];
    for (let i = 365; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const match = activityMap.get(dateStr) || { seconds: 0, tests: 0, words: 0, avgWpm: 0 };

      // Calculate intensity level 0 - 4
      let level = 0;
      if (match.seconds > 0) {
        if (match.seconds < 300) level = 1; // < 5 mins
        else if (match.seconds < 900) level = 2; // 5 - 15 mins
        else if (match.seconds < 1800) level = 3; // 15 - 30 mins
        else level = 4; // > 30 mins
      }

      daysData.push({
        date: dateStr,
        dayOfWeek: d.getDay(),
        seconds: match.seconds,
        minutes: Number((match.seconds / 60).toFixed(1)),
        tests: match.tests,
        words: match.words,
        avgWpm: match.avgWpm,
        level,
      });
    }

    res.json({
      days: daysData,
      totalActiveDays: activities.length,
      totalPracticeSeconds: activities.reduce((sum, a) => sum + a.practiceSeconds, 0),
    });
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({ error: 'Failed to retrieve activity heatmap data' });
  }
});

// GET /api/analytics/monthly
// Returns last 12 months with total time, avg WPM, total tests, avg accuracy
router.get('/monthly', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const tests = await prisma.typingTest.findMany({
      where: {
        userId,
        createdAt: {
          gte: twelveMonthsAgo,
        },
      },
      select: {
        wpm: true,
        accuracy: true,
        practiceTime: true,
        createdAt: true,
      },
    });

    // Group tests by YYYY-MM
    const monthMap = new Map<string, { wpmSum: number; accSum: number; count: number; practiceSeconds: number }>();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, { wpmSum: 0, accSum: 0, count: 0, practiceSeconds: 0 });
    }

    tests.forEach((t) => {
      const d = new Date(t.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap.has(key)) {
        const item = monthMap.get(key)!;
        item.wpmSum += t.wpm;
        item.accSum += t.accuracy;
        item.count += 1;
        item.practiceSeconds += t.practiceTime;
      }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = Array.from(monthMap.entries()).map(([key, data]) => {
      const [yearStr, monthStr] = key.split('-');
      const monthIdx = parseInt(monthStr, 10) - 1;
      const monthLabel = `${monthNames[monthIdx]} '${yearStr.slice(2)}`;

      return {
        monthKey: key,
        monthLabel,
        totalTests: data.count,
        practiceMinutes: Number((data.practiceSeconds / 60).toFixed(1)),
        avgWpm: data.count > 0 ? Number((data.wpmSum / data.count).toFixed(1)) : 0,
        avgAccuracy: data.count > 0 ? Number((data.accSum / data.count).toFixed(1)) : 0,
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching monthly analytics:', error);
    res.status(500).json({ error: 'Failed to retrieve monthly analytics' });
  }
});

// GET /api/analytics/daily?period=7d|30d|6m|1y
router.get('/daily', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const period = (req.query.period as string) || '30d';

    let dayCount = 30;
    if (period === '7d') dayCount = 7;
    else if (period === '30d') dayCount = 30;
    else if (period === '6m') dayCount = 180;
    else if (period === '1y') dayCount = 365;

    const now = new Date();
    const startDate = new Date(now.getTime() - dayCount * 86400000);
    const startDateStr = startDate.toISOString().split('T')[0];

    const activities = await prisma.dailyActivity.findMany({
      where: {
        userId,
        activityDate: {
          gte: startDateStr,
        },
      },
      orderBy: { activityDate: 'asc' },
    });

    const actMap = new Map<string, { seconds: number; tests: number; avgWpm: number }>();
    activities.forEach((a) => {
      actMap.set(a.activityDate, {
        seconds: a.practiceSeconds,
        tests: a.testsCompleted,
        avgWpm: a.avgWpm,
      });
    });

    const result = [];
    for (let i = dayCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const match = actMap.get(dateStr) || { seconds: 0, tests: 0, avgWpm: 0 };

      result.push({
        date: dateStr,
        label: `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        practiceMinutes: Number((match.seconds / 60).toFixed(1)),
        testsCompleted: match.tests,
        avgWpm: match.avgWpm,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching daily analytics:', error);
    res.status(500).json({ error: 'Failed to retrieve daily analytics' });
  }
});

// GET /api/analytics/progress
// Returns timeline of test results to chart WPM, Accuracy, and Consistency over time
router.get('/progress', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const limit = Math.min(200, Math.max(10, parseInt(req.query.limit as string) || 60));

    const tests = await prisma.typingTest.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: {
        id: true,
        wpm: true,
        rawWpm: true,
        accuracy: true,
        consistency: true,
        practiceTime: true,
        createdAt: true,
      },
    });

    const formatted = tests.map((t, idx) => ({
      index: idx + 1,
      id: t.id,
      date: t.createdAt.toISOString().split('T')[0],
      wpm: t.wpm,
      rawWpm: t.rawWpm,
      accuracy: t.accuracy,
      consistency: t.consistency,
      practiceTime: t.practiceTime,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching progress analytics:', error);
    res.status(500).json({ error: 'Failed to retrieve progress data' });
  }
});

export default router;

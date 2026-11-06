import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Award,
  Zap,
  Flame,
  TrendingUp,
  Activity,
  BarChart3,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { HeatmapDay, UserSummary } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AnalyticsDashboard: React.FC = () => {
  const { token } = useAuth();
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [heatmapDays, setHeatmapDays] = useState<HeatmapDay[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [dailyPeriod, setDailyPeriod] = useState<'7d' | '30d' | '6m' | '1y'>('30d');
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  useEffect(() => {
    fetchDaily(dailyPeriod);
  }, [dailyPeriod, token]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [summaryRes, heatmapRes, monthlyRes, progressRes] = await Promise.all([
        fetch('/api/typing-tests/summary', { headers }),
        fetch('/api/analytics/heatmap', { headers }),
        fetch('/api/analytics/monthly', { headers }),
        fetch('/api/analytics/progress', { headers }),
      ]);

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (heatmapRes.ok) {
        const hData = await heatmapRes.json();
        setHeatmapDays(hData.days || []);
      }
      if (monthlyRes.ok) setMonthlyData(await monthlyRes.json());
      if (progressRes.ok) setProgressData(await progressRes.json());
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDaily = async (period: string) => {
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/analytics/daily?period=${period}`, { headers });
      if (res.ok) {
        setDailyData(await res.json());
      }
    } catch (err) {
      console.error('Failed to load daily data:', err);
    }
  };

  // Format practice seconds to human readable
  const formatSeconds = (totalSec: number) => {
    if (!totalSec) return '0m';
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Group heatmap days into 53 weeks (columns) x 7 days (rows)
  const renderHeatmapGrid = () => {
    if (heatmapDays.length === 0) return null;

    const weeks: HeatmapDay[][] = [];
    let currentWeek: HeatmapDay[] = [];

    heatmapDays.forEach((day, idx) => {
      currentWeek.push(day);
      if (day.dayOfWeek === 6 || idx === heatmapDays.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return (
      <div className="flex gap-1 overflow-x-auto pb-2 scroll-smooth">
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-1">
            {week.map((d) => {
              let bgClass = 'bg-bg-secondary/80 border-border-color/30';
              if (d.level === 1) bgClass = 'bg-accent/30 border-accent/40';
              else if (d.level === 2) bgClass = 'bg-accent/50 border-accent/60';
              else if (d.level === 3) bgClass = 'bg-accent/75 border-accent/80';
              else if (d.level === 4) bgClass = 'bg-accent border-accent-hover shadow-xs shadow-accent/40';

              return (
                <div
                  key={d.date}
                  onMouseEnter={() => setHoveredDay(d)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`w-3 h-3 rounded-xs border transition-all cursor-pointer hover:scale-125 hover:z-10 ${bgClass}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading && !summary) {
    return (
      <div className="w-full flex items-center justify-center py-24 text-text-muted">
        <Loader2 className="w-6 h-6 animate-spin text-accent mr-2" />
        <span>Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Performance & Activity Analytics
            </h1>
          </div>
          <p className="text-xs text-text-secondary">
            Long-term consistency, typing speed velocity, and historical metrics
          </p>
        </div>
      </div>

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {/* Practice Time */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-color shadow-sm">
          <div className="flex items-center justify-between text-text-muted mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Practice Time
            </span>
            <Clock className="w-4 h-4 text-accent" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-text-primary font-mono-typing">
            {formatSeconds(summary?.totalPracticeSeconds || 0)}
          </span>
          <span className="block text-[11px] text-text-muted mt-1">Total focused typing</span>
        </div>

        {/* Highest WPM (PB) */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-color shadow-sm">
          <div className="flex items-center justify-between text-text-muted mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Highest WPM
            </span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono-typing">
            {summary?.highestWpm || 0}
          </span>
          <span className="block text-[11px] text-text-muted mt-1">All-time Personal Best</span>
        </div>

        {/* Average WPM */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-color shadow-sm">
          <div className="flex items-center justify-between text-text-muted mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Average WPM
            </span>
            <Zap className="w-4 h-4 text-accent" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-text-primary font-mono-typing">
            {summary?.avgWpm || 0}
          </span>
          <span className="block text-[11px] text-text-muted mt-1">
            Avg Accuracy: {summary?.avgAccuracy || 0}%
          </span>
        </div>

        {/* Streaks */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-color shadow-sm">
          <div className="flex items-center justify-between text-text-muted mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-error">
              Current Streak
            </span>
            <Flame className="w-4 h-4 text-error fill-error/20" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-text-primary font-mono-typing">
              {summary?.currentStreak || 0}
            </span>
            <span className="text-xs text-text-muted">days</span>
          </div>
          <span className="block text-[11px] text-text-muted mt-1">
            Best streak: {summary?.longestStreak || 0} days
          </span>
        </div>
      </div>

      {/* A. GitHub-Style 365-Day Activity Heatmap */}
      <div className="w-full bg-bg-card rounded-2xl border border-border-color p-6 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Annual Practice Activity Heatmap (365 Days)
            </h3>
          </div>

          {/* Hover Tooltip or Legend */}
          <div className="text-xs font-mono">
            {hoveredDay ? (
              <span className="text-accent bg-accent/10 px-2 py-1 rounded-md border border-accent/20">
                {hoveredDay.date}: {hoveredDay.minutes} mins • {hoveredDay.tests} tests • {hoveredDay.avgWpm} wpm
              </span>
            ) : (
              <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
                <span>Less</span>
                <span className="w-2.5 h-2.5 rounded-xs bg-bg-secondary border border-border-color/30" />
                <span className="w-2.5 h-2.5 rounded-xs bg-accent/30 border border-accent/40" />
                <span className="w-2.5 h-2.5 rounded-xs bg-accent/50 border border-accent/60" />
                <span className="w-2.5 h-2.5 rounded-xs bg-accent/75 border border-accent/80" />
                <span className="w-2.5 h-2.5 rounded-xs bg-accent border border-accent-hover" />
                <span>More</span>
              </div>
            )}
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="mt-2">{renderHeatmapGrid()}</div>
      </div>

      {/* C. Daily Activity Graph with Period Switcher */}
      <div className="w-full bg-bg-card rounded-2xl border border-border-color p-6 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Daily Practice Time & Tests
            </h3>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1 bg-bg-secondary p-1 rounded-xl border border-border-color/60 text-xs">
            {(['7d', '30d', '6m', '1y'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setDailyPeriod(period)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  dailyPeriod === period
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
              <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="practiceMinutes" name="Practice (mins)" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Activity & Progress Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Activity Graph */}
        <div className="bg-bg-card rounded-2xl border border-border-color p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Monthly Typing Time & Average Speed
            </h3>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                <XAxis dataKey="monthLabel" stroke="var(--text-muted)" fontSize={10} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="practiceMinutes" name="Minutes" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgWpm" name="Avg WPM" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Trendline */}
        <div className="bg-bg-card rounded-2xl border border-border-color p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Typing Speed & Accuracy Trendline
            </h3>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                <XAxis dataKey="index" stroke="var(--text-muted)" fontSize={10} tickFormatter={(val) => `#${val}`} />
                <YAxis stroke="var(--text-muted)" fontSize={11} domain={[30, 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="wpm" name="WPM" stroke="var(--accent)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#10b981" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import {
  RotateCcw,
  Sparkles,
  Trophy,
  Activity,
  Target,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import confetti from 'canvas-confetti';
import type { TypingTestResult } from '../../types';

interface ResultScreenProps {
  result: TypingTestResult;
  onRestart: () => void;
  onNewText: () => void;
  onPracticeMissedWords: (words: string[]) => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  onRestart,
  onNewText,
  onPracticeMissedWords,
}) => {
  // Fire confetti if personal best
  useEffect(() => {
    if (result.isPersonalBest) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
        });
      } catch {}
    }
  }, [result.isPersonalBest]);

  // Extract missed words from this test
  const missedWords = result.wordsData
    ? result.wordsData.filter((w) => w.isMistake || w.mistakes > 0).map((w) => w.word)
    : [];

  // Prepare chart timeline data
  const chartData =
    result.timelineData && result.timelineData.length > 0
      ? result.timelineData
      : [
          { second: 0, wpm: 0, rawWpm: 0, errors: 0 },
          { second: Math.round(result.duration / 2), wpm: result.wpm * 0.9, rawWpm: result.rawWpm * 0.9, errors: 0 },
          { second: Math.round(result.duration), wpm: result.wpm, rawWpm: result.rawWpm, errors: result.incorrectCharacters },
        ];

  return (
    <div className="w-full max-w-5xl mx-auto my-auto py-8 px-4 flex flex-col items-center animate-in fade-in duration-300">
      {/* Personal Best Banner */}
      {result.isPersonalBest && (
        <div className="mb-6 py-2 px-5 rounded-full bg-gradient-to-r from-accent/20 via-accent/30 to-accent/20 border border-accent/50 text-accent font-semibold text-xs flex items-center gap-2 shadow-lg shadow-accent/20 animate-bounce">
          <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>🎉 NEW PERSONAL BEST!</span>
        </div>
      )}

      {/* Main Score Hero Cards Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {/* WPM Card */}
        <div className="flex flex-col p-5 rounded-2xl bg-bg-card border border-border-color shadow-sm">
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Net WPM
          </span>
          <span className="text-4xl sm:text-5xl font-extrabold text-accent font-mono-typing mt-1">
            {result.wpm}
          </span>
          <span className="text-[11px] text-text-muted mt-1">
            Raw: <span className="text-text-primary font-mono">{result.rawWpm}</span>
          </span>
        </div>

        {/* Accuracy Card */}
        <div className="flex flex-col p-5 rounded-2xl bg-bg-card border border-border-color shadow-sm">
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Accuracy
          </span>
          <span className="text-4xl sm:text-5xl font-extrabold text-text-primary font-mono-typing mt-1">
            {result.accuracy}%
          </span>
          <span className="text-[11px] text-text-muted mt-1">
            Errors: <span className="text-error font-mono">{result.incorrectCharacters}</span>
          </span>
        </div>

        {/* Consistency Card */}
        <div className="flex flex-col p-5 rounded-2xl bg-bg-card border border-border-color shadow-sm">
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Consistency
          </span>
          <span className="text-4xl sm:text-5xl font-extrabold text-text-primary font-mono-typing mt-1">
            {result.consistency}%
          </span>
          <span className="text-[11px] text-text-muted mt-1">Pacing Stability</span>
        </div>

        {/* Characters Card */}
        <div className="flex flex-col p-5 rounded-2xl bg-bg-card border border-border-color shadow-sm">
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Characters
          </span>
          <div className="flex items-baseline gap-1 mt-1 font-mono-typing text-2xl sm:text-3xl font-bold">
            <span className="text-success">{result.correctCharacters}</span>
            <span className="text-text-muted text-lg">/</span>
            <span className="text-error">{result.incorrectCharacters}</span>
          </div>
          <span className="text-[11px] text-text-muted mt-2">
            Time: <span className="text-text-primary">{result.practiceTime}s</span>
          </span>
        </div>
      </div>

      {/* WPM Timeline Performance Graph */}
      <div className="w-full bg-bg-card/70 border border-border-color rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Pacing & Speed Timeline
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-accent">
              <span className="w-2.5 h-2.5 rounded-full bg-accent"></span> WPM
            </span>
            <span className="flex items-center gap-1.5 text-text-muted">
              <span className="w-2.5 h-2.5 rounded-full bg-text-muted"></span> Raw WPM
            </span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
              <XAxis
                dataKey="second"
                stroke="var(--text-muted)"
                fontSize={11}
                tickFormatter={(val) => `${val}s`}
              />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="rawWpm"
                stroke="var(--text-muted)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
              />
              <Area
                type="monotone"
                dataKey="wpm"
                stroke="var(--accent)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#wpmGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Missed Words Breakdown & Instant Drill Action */}
      {missedWords.length > 0 && (
        <div className="w-full bg-bg-card/70 border border-border-color rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-error flex items-center gap-1.5">
              <Target className="w-4 h-4 text-error" />
              Missed Words in this Test ({missedWords.length})
            </span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {missedWords.map((w, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-error/10 text-error border border-error/25 text-xs font-mono font-medium"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => onPracticeMissedWords(missedWords)}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white hover:bg-accent-hover text-xs font-semibold shadow-md shadow-accent/25 transition-all"
          >
            <span>Practice These Words Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={onRestart}
          title="Restart Test (Tab)"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-card hover:bg-bg-secondary text-text-primary border border-border-color text-xs font-semibold shadow-sm transition-all"
        >
          <RotateCcw className="w-4 h-4 text-accent" />
          <span>Restart Test (Tab)</span>
        </button>

        <button
          onClick={onNewText}
          title="New Test (Shift + Enter)"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white hover:bg-accent-hover text-xs font-semibold shadow-lg shadow-accent/25 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Next Test (Shift + Enter)</span>
        </button>
      </div>
    </div>
  );
};

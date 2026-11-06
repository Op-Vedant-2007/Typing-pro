import React, { useState, useEffect } from 'react';
import {
  Target,
  Search,
  ArrowUpDown,
  Zap,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Play,
  Loader2,
} from 'lucide-react';
import type { WordStatistic } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { TargetedPracticeModal } from './TargetedPracticeModal';

interface WeakWordsDashboardProps {
  onStartTargetedPractice: (text: string, count: number, mode: 'words' | 'sentence', targetedWords: string[]) => void;
}

export const WeakWordsDashboard: React.FC<WeakWordsDashboardProps> = ({
  onStartTargetedPractice,
}) => {
  const { token } = useAuth();
  const [words, setWords] = useState<WordStatistic[]>([]);
  const [counts, setCounts] = useState({ total: 0, weak: 0, needsImprovement: 0, strong: 0 });
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('errorRate');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [singlePracticeWord, setSinglePracticeWord] = useState<string[]>([]);

  useEffect(() => {
    fetchWeakWords();
  }, [filter, search, sortBy, order, token]);

  const fetchWeakWords = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/weak-words?filter=${filter}&search=${encodeURIComponent(
          search
        )}&sortBy=${sortBy}&order=${order}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setWords(data.words || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error('Failed to load weak words:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
  };

  const handlePracticeSpecificWord = (word: string) => {
    setSinglePracticeWord([word]);
    setIsModalOpen(true);
  };

  const openGeneralTargetedModal = () => {
    setSinglePracticeWord([]);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 animate-in fade-in duration-300">
      {/* Page Title & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Weak Words Analysis
            </h1>
          </div>
          <p className="text-xs text-text-secondary">
            Personalized error tracking detects hesitation and accuracy bottlenecks across your typing
          </p>
        </div>

        <button
          onClick={openGeneralTargetedModal}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-hover text-white text-xs font-bold shadow-lg shadow-accent/25 hover:scale-102 active:scale-98 transition-all"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Practice My Weak Words</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Tracked Words */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-color shadow-sm">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Tracked Words
            </span>
            <Target className="w-4 h-4 text-accent" />
          </div>
          <span className="text-3xl font-extrabold text-text-primary font-mono-typing">
            {counts.total}
          </span>
          <span className="block text-[11px] text-text-muted mt-1">
            Monitored from your tests
          </span>
        </div>

        {/* Critical Weak Words */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-color shadow-sm">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-error">
              Critical Weak (&gt;25%)
            </span>
            <AlertTriangle className="w-4 h-4 text-error" />
          </div>
          <span className="text-3xl font-extrabold text-error font-mono-typing">
            {counts.weak}
          </span>
          <span className="block text-[11px] text-text-muted mt-1">
            Frequent spelling bottlenecks
          </span>
        </div>

        {/* Needs Improvement */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-color shadow-sm">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Needs Practice (10-25%)
            </span>
            <TrendingDown className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-extrabold text-amber-400 font-mono-typing">
            {counts.needsImprovement}
          </span>
          <span className="block text-[11px] text-text-muted mt-1">
            Moderate error frequency
          </span>
        </div>

        {/* Mastered / Strong */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-color shadow-sm">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-success">
              Mastered (&lt;10%)
            </span>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <span className="text-3xl font-extrabold text-success font-mono-typing">
            {counts.strong}
          </span>
          <span className="block text-[11px] text-text-muted mt-1">
            High accuracy & speed
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Filter Tabs */}
        <div className="w-full md:w-auto flex items-center gap-1 bg-bg-secondary p-1 rounded-xl border border-border-color/60 text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All Words' },
            { id: 'top10', label: 'Top 10 Weakest' },
            { id: 'most_mistakes', label: 'Most Mistakes' },
            { id: 'weak', label: 'Critical Weak' },
            { id: 'needs_improvement', label: 'Needs Practice' },
            { id: 'strong', label: 'Mastered' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-accent text-white shadow-sm shadow-accent/25'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full md:w-64 relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search words..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-card border border-border-color rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      {/* Words Table */}
      <div className="w-full bg-bg-card rounded-2xl border border-border-color overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-color bg-bg-secondary/50 text-text-secondary uppercase tracking-wider font-semibold">
                <th
                  onClick={() => handleSort('word')}
                  className="py-3 px-4 cursor-pointer hover:text-text-primary"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Word</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('errorRate')}
                  className="py-3 px-4 cursor-pointer hover:text-text-primary"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Error Rate</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('mistakes')}
                  className="py-3 px-4 cursor-pointer hover:text-text-primary"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Mistakes</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('attempts')}
                  className="py-3 px-4 cursor-pointer hover:text-text-primary"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Attempts</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('averageTypingTime')}
                  className="py-3 px-4 cursor-pointer hover:text-text-primary"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Avg Time</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color/40">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-accent mb-2" />
                    <span>Analyzing word performance...</span>
                  </td>
                </tr>
              ) : words.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    No words found. Complete a few typing tests to populate weak word analysis!
                  </td>
                </tr>
              ) : (
                words.map((item) => {
                  const isRed = item.errorRate > 25;
                  const isYellow = item.errorRate >= 10 && item.errorRate <= 25;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-bg-secondary/40 transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-text-primary text-sm">
                        {item.word}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`font-semibold ${
                            isRed
                              ? 'text-error'
                              : isYellow
                              ? 'text-amber-400'
                              : 'text-success'
                          }`}
                        >
                          {item.errorRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-text-secondary">
                        {item.mistakes}
                      </td>
                      <td className="py-3 px-4 font-mono text-text-secondary">
                        {item.attempts}
                      </td>
                      <td className="py-3 px-4 font-mono text-text-secondary">
                        {item.averageTypingTime}ms
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            isRed
                              ? 'bg-error/15 text-error border border-error/30'
                              : isYellow
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-success/15 text-success border border-success/30'
                          }`}
                        >
                          {isRed
                            ? '🔴 Weak'
                            : isYellow
                            ? '🟡 Needs Practice'
                            : '🟢 Mastered'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handlePracticeSpecificWord(item.word)}
                          title={`Drill "${item.word}"`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-secondary hover:bg-accent hover:text-white border border-border-color text-text-secondary text-xs transition-all"
                        >
                          <Play className="w-3 h-3" />
                          <span>Practice</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Targeted Practice Modal */}
      <TargetedPracticeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialWords={singlePracticeWord}
        onStartPractice={onStartTargetedPractice}
      />
    </div>
  );
};

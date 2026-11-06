import { apiUrl } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { History, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { TypingTestResult } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const TypingHistory: React.FC = () => {
  const { token } = useAuth();
  const [tests, setTests] = useState<TypingTestResult[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchHistory();
  }, [page, modeFilter, token]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(
      apiUrl(`/api/typing-tests/history?page=${page}&limit=12&mode=${modeFilter}`),
      { headers }
  );
      if (res.ok) {
        const data = await res.json();
        setTests(data.tests || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Just now';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Typing Test History
            </h1>
          </div>
          <p className="text-xs text-text-secondary">
            Full record of all your completed practice sessions ({total} total tests recorded)
          </p>
        </div>

        {/* Mode filter */}
        <div className="flex items-center gap-1 bg-bg-secondary p-1 rounded-xl border border-border-color/60 text-xs">
          {['all', 'time', 'words', 'quote', 'sentence', 'weak_words', 'zen'].map((m) => (
            <button
              key={m}
              onClick={() => {
                setModeFilter(m);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                modeFilter === m
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {m.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="w-full bg-bg-card rounded-2xl border border-border-color overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-color bg-bg-secondary/50 text-text-secondary uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">WPM</th>
                <th className="py-3 px-4">Raw WPM</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Consistency</th>
                <th className="py-3 px-4 text-right">Characters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color/40">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-accent mb-2" />
                    <span>Loading past tests...</span>
                  </td>
                </tr>
              ) : tests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    No typing tests recorded yet in this category. Complete a test to start tracking!
                  </td>
                </tr>
              ) : (
                tests.map((test) => (
                  <tr key={test.id} className="hover:bg-bg-secondary/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-text-secondary">
                      {formatDate(test.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-bg-secondary border border-border-color text-text-primary font-mono text-[11px] capitalize">
                        {test.mode.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary">
                      {test.duration}s
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-accent text-sm">
                      {test.wpm}
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary">
                      {test.rawWpm}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-text-primary">
                      {test.accuracy}%
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary">
                      {test.consistency}%
                    </td>
                    <td className="py-3 px-4 font-mono text-right">
                      <span className="text-success font-medium">{test.correctCharacters}</span>
                      <span className="text-text-muted mx-1">/</span>
                      <span className="text-error font-medium">{test.incorrectCharacters}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-color bg-bg-secondary/30 text-xs text-text-secondary">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-border-color hover:bg-bg-card disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-border-color hover:bg-bg-card disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

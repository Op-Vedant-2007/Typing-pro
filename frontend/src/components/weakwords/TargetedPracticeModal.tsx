import React, { useState } from 'react';
import { X, Target, Sparkles, Type, AlignLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TargetedPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPractice: (text: string, count: number, mode: 'words' | 'sentence', targetedWords: string[]) => void;
  initialWords?: string[];
}

export const TargetedPracticeModal: React.FC<TargetedPracticeModalProps> = ({
  isOpen,
  onClose,
  onStartPractice,
  initialWords = [],
}) => {
  const { token } = useAuth();
  const [countOption, setCountOption] = useState<'5' | '10' | '20' | 'all' | 'custom'>('10');
  const [practiceMode, setPracticeMode] = useState<'words' | 'sentence'>('words');
  const [targetWordCount, setTargetWordCount] = useState<number>(30);
  const [customWordsInput, setCustomWordsInput] = useState<string>(initialWords.join(', '));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLaunch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (countOption === 'custom') {
        // Custom test generation
        const words = customWordsInput
          .split(/[\s,\n]+/)
          .map((w) => w.trim().toLowerCase())
          .filter((w) => w.length > 0);

        if (words.length === 0) {
          throw new Error('Please enter at least one word to practice');
        }

        const res = await fetch('/api/weak-words/custom-test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            words,
            count: targetWordCount,
            mode: practiceMode,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate custom test');

        onStartPractice(data.text, targetWordCount, practiceMode, data.words);
        onClose();
      } else {
        // Targeted weak words retrieval from DB
        const res = await fetch(
          `/api/weak-words/targeted-test?countOption=${countOption}&mode=${practiceMode}&targetWordCount=${targetWordCount}`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate targeted practice');

        const targetedWordsList = (data.targetedWords || []).map((w: any) => w.word);
        onStartPractice(data.text, targetWordCount, practiceMode, targetedWordsList);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate test');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-bg-card rounded-2xl border border-border-color shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Targeted Weak Words Practice
            </h2>
            <p className="text-xs text-text-secondary">
              Personalized algorithms repeat your most challenging words
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* 1. Word Source Selection */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
              Select Practice Scope
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: '5', label: 'Top 5' },
                { id: '10', label: 'Top 10' },
                { id: '20', label: 'Top 20' },
                { id: 'all', label: 'All Weak' },
                { id: 'custom', label: 'Custom' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCountOption(opt.id as any)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all text-center ${
                    countOption === opt.id
                      ? 'bg-accent text-white border-accent shadow-sm shadow-accent/25'
                      : 'bg-bg-secondary border-border-color text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Word Input if Custom option is selected */}
          {countOption === 'custom' && (
            <div className="animate-in fade-in duration-150">
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Enter Custom Words (comma or space separated)
              </label>
              <textarea
                rows={3}
                placeholder="definitely, rhythm, necessary, accommodate, privilege"
                value={customWordsInput}
                onChange={(e) => setCustomWordsInput(e.target.value)}
                className="w-full bg-bg-secondary border border-border-color rounded-xl p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent font-mono transition-colors"
              />
            </div>
          )}

          {/* 2. Practice Mode: Words vs Sentence */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
              Practice Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPracticeMode('words')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  practiceMode === 'words'
                    ? 'bg-accent/15 border-accent text-accent'
                    : 'bg-bg-secondary border-border-color text-text-secondary hover:text-text-primary'
                }`}
              >
                <Type className="w-4 h-4 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold">Repetition Drill</span>
                  <span className="block text-[11px] text-text-muted">
                    High repetition mixed with natural connectors
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPracticeMode('sentence')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  practiceMode === 'sentence'
                    ? 'bg-accent/15 border-accent text-accent'
                    : 'bg-bg-secondary border-border-color text-text-secondary hover:text-text-primary'
                }`}
              >
                <AlignLeft className="w-4 h-4 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold">Sentence Mode</span>
                  <span className="block text-[11px] text-text-muted">
                    Natural sentences constructed with weak words
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Word Count Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Practice Length
              </label>
              <span className="text-xs font-mono font-bold text-accent">
                {targetWordCount} words
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[15, 25, 50, 100].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTargetWordCount(num)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                    targetWordCount === num
                      ? 'bg-accent text-white border-accent'
                      : 'bg-bg-secondary border-border-color text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Launch Button */}
          <button
            type="button"
            onClick={handleLaunch}
            disabled={isLoading}
            className="w-full mt-4 py-3 px-4 rounded-xl bg-accent text-white hover:bg-accent-hover text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-accent/25 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Personalized Test...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Start Targeted Practice Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

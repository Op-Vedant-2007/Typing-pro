import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { TypingArea } from './components/test/TypingArea';
import { ResultScreen } from './components/test/ResultScreen';
import { WeakWordsDashboard } from './components/weakwords/WeakWordsDashboard';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { TypingHistory } from './components/history/TypingHistory';
import { SettingsView } from './components/settings/SettingsView';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { TargetedPracticeModal } from './components/weakwords/TargetedPracticeModal';
import type { TestMode, TypingTestResult } from './types';
import { generateTestText } from './utils/textGenerator';
import { CheckCircle2 } from 'lucide-react';

function MainApp() {
  const { token, settings } = useAuth();

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<'test' | 'weakwords' | 'analytics' | 'history' | 'settings'>('test');

  // Test configuration
  const [mode, setMode] = useState<TestMode>('time');
  const [duration, setDuration] = useState<number>(30);
  const [wordCount, setWordCount] = useState<number>(25);
  const [punctuation, setPunctuation] = useState<boolean>(false);
  const [numbers, setNumbers] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');

  // Target text & quote attribution
  const [targetText, setTargetText] = useState<string>('');
  const [quoteInfo, setQuoteInfo] = useState<{ author: string } | undefined>(undefined);

  // Active result state
  const [currentResult, setCurrentResult] = useState<TypingTestResult | null>(null);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isTargetedModalOpen, setIsTargetedModalOpen] = useState<boolean>(false);

  // Targeted practice tracking
  const [targetedWordsBeingPracticed, setTargetedWordsBeingPracticed] = useState<string[]>([]);
  const [postPracticeBanner, setPostPracticeBanner] = useState<string | null>(null);

  // Initialize preferences from user settings if available
  useEffect(() => {
    if (settings) {
      if (settings.preferredMode) setMode(settings.preferredMode as TestMode);
      if (settings.preferredTestDuration) setDuration(settings.preferredTestDuration);
      if (settings.preferredWordCount) setWordCount(settings.preferredWordCount);
      if (settings.punctuation !== undefined) setPunctuation(settings.punctuation);
      if (settings.numbers !== undefined) setNumbers(settings.numbers);
    }
  }, [settings]);

  // Generate test text
  const generateNewTest = useCallback(() => {
    setCurrentResult(null);
    const generated = generateTestText({
      mode,
      wordCount,
      punctuation,
      numbers,
      customText,
    });
    setTargetText(generated.text);
    setQuoteInfo(generated.quoteInfo);
  }, [mode, wordCount, punctuation, numbers, customText]);

  // Initial text generation on mount or config change
  useEffect(() => {
    if (mode !== 'weak_words' && mode !== 'custom') {
      generateNewTest();
    }
  }, [mode, duration, wordCount, punctuation, numbers, generateNewTest]);

  // Restart current test with same text
  const handleRestart = () => {
    setCurrentResult(null);
    setTargetText((prev) => `${prev} `);
    setTimeout(() => {
      setTargetText((prev) => prev.trim());
    }, 10);
  };

  // Generate completely new text
  const handleNewText = () => {
    setPostPracticeBanner(null);
    setTargetedWordsBeingPracticed([]);
    if (mode === 'weak_words') {
      setIsTargetedModalOpen(true);
    } else {
      generateNewTest();
    }
  };

  // Test complete callback
  const handleTestComplete = async (result: TypingTestResult) => {
    setCurrentResult(result);

    // If targeted practice was active, show feedback
    if (targetedWordsBeingPracticed.length > 0) {
      setPostPracticeBanner(
        `🎯 Completed Targeted Practice for ${targetedWordsBeingPracticed.length} weak words!`
      );
    }

    // Persist to backend API if authenticated or demo
    try {
      const res = await fetch('/api/typing-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(result),
      });

      if (res.ok) {
        const savedData = await res.json();
        if (savedData.isPersonalBest) {
          setCurrentResult((prev) => (prev ? { ...prev, isPersonalBest: true } : null));
        }
      }
    } catch (err) {
      console.error('Failed to save test result to database:', err);
    }
  };

  // Practice missed words directly from ResultScreen
  const handlePracticeMissedWords = (missedWords: string[]) => {
    const drillText = missedWords
      .map((w) => `${w} ${w}`)
      .concat(missedWords)
      .sort(() => Math.random() - 0.5)
      .join(' ');

    setMode('custom');
    setCustomText(drillText);
    setTargetText(drillText);
    setCurrentResult(null);
    setCurrentTab('test');
    setTargetedWordsBeingPracticed(missedWords);
  };

  // Start targeted practice drill
  const handleStartTargetedPractice = (
    text: string,
    count: number,
    _drillMode: 'words' | 'sentence',
    targetedWords: string[]
  ) => {
    setMode('weak_words');
    setWordCount(count);
    setTargetText(text);
    setQuoteInfo(undefined);
    setTargetedWordsBeingPracticed(targetedWords);
    setCurrentResult(null);
    setCurrentTab('test');
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + P: Open settings
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        setCurrentTab('settings');
        return;
      }

      // Ctrl + Shift + W: Open Weak Words practice
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'W' || e.key === 'w')) {
        e.preventDefault();
        setIsTargetedModalOpen(true);
        return;
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        setIsAuthModalOpen(false);
        setIsProfileModalOpen(false);
        setIsTargetedModalOpen(false);
        return;
      }

      // When on result screen: Tab restarts, Shift+Enter triggers new test
      if (currentResult) {
        if (e.key === 'Tab') {
          e.preventDefault();
          handleRestart();
        } else if (e.key === 'Enter' && e.shiftKey) {
          e.preventDefault();
          handleNewText();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleRestart();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [currentResult, handleRestart, handleNewText]);

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-accent/30 selection:text-accent">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'test' && !targetText) {
            generateNewTest();
          }
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center max-w-6xl w-full mx-auto px-4 py-4">
        {/* Post-practice feedback banner */}
        {postPracticeBanner && currentTab === 'test' && !currentResult && (
          <div className="w-full max-w-2xl mx-auto mb-4 py-2 px-4 rounded-xl bg-accent/15 border border-accent/30 text-accent text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span className="font-medium">{postPracticeBanner}</span>
            </div>
            <button
              onClick={() => setPostPracticeBanner(null)}
              className="text-text-muted hover:text-text-primary text-[10px] uppercase font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Practice / Typing Test */}
        {currentTab === 'test' && (
          <>
            {currentResult ? (
              <ResultScreen
                result={currentResult}
                onRestart={handleRestart}
                onNewText={handleNewText}
                onPracticeMissedWords={handlePracticeMissedWords}
              />
            ) : (
              <TypingArea
                targetText={targetText}
                quoteInfo={quoteInfo}
                mode={mode}
                setMode={setMode}
                duration={duration}
                setDuration={setDuration}
                wordCount={wordCount}
                setWordCount={setWordCount}
                punctuation={punctuation}
                setPunctuation={setPunctuation}
                numbers={numbers}
                setNumbers={setNumbers}
                onRestart={handleRestart}
                onNewText={handleNewText}
                onTestComplete={handleTestComplete}
                onOpenWeakWords={() => setIsTargetedModalOpen(true)}
              />
            )}
          </>
        )}

        {/* Tab 2: Weak Words Dashboard */}
        {currentTab === 'weakwords' && (
          <WeakWordsDashboard
            onStartTargetedPractice={handleStartTargetedPractice}
          />
        )}

        {/* Tab 3: Analytics & Activity Dashboard */}
        {currentTab === 'analytics' && <AnalyticsDashboard />}

        {/* Tab 4: Typing History */}
        {currentTab === 'history' && <TypingHistory />}

        {/* Tab 5: Settings */}
        {currentTab === 'settings' && <SettingsView />}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-4 py-4 border-t border-border-color/30 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-2">
        <div className="flex items-center gap-3">
          <span className="font-mono-typing font-bold text-text-secondary">TypeFlow</span>
          <span>•</span>
          <span>Next-Gen Typing Practice & Personalized Learning</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono-typing">
          <span>[tab] restart</span>
          <span>[shift + enter] new</span>
          <span>[ctrl + shift + p] settings</span>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <TargetedPracticeModal
        isOpen={isTargetedModalOpen}
        onClose={() => setIsTargetedModalOpen(false)}
        onStartPractice={handleStartTargetedPractice}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </AuthProvider>
  );
}

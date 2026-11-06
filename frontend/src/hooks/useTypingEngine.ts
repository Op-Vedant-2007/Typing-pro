import { useState, useEffect, useRef, useCallback } from 'react';
import type { TestMode, TypingTestResult, WordPerformance, TimelinePoint } from '../types';
import { soundEngine } from '../utils/soundEngine';
import { getRandomWords } from '../utils/textGenerator';

interface TypingEngineProps {
  targetText: string;
  mode: TestMode;
  duration: number; // in seconds (for time mode)
  targetWordCount: number; // for words mode
  punctuation: boolean;
  numbers: boolean;
  onTestComplete: (result: TypingTestResult) => void;
  onRestart: () => void;
  onNewText: () => void;
}

export function useTypingEngine({
  targetText,
  mode,
  duration,
  targetWordCount,
  punctuation,
  numbers,
  onTestComplete,
  onRestart,
  onNewText,
}: TypingEngineProps) {
  // Words state (allows infinite dynamic appending in time/zen modes)
  const [words, setWords] = useState<string[]>(() => {
    return targetText.split(/\s+/).filter((w) => w.length > 0);
  });

  // User typing state
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]); // completed typed words

  // Timing
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Character counters
  const totalTypedCharsRef = useRef<number>(0);
  const wordPerformancesRef = useRef<WordPerformance[]>([]);
  const timelineRef = useRef<TimelinePoint[]>([]);
  const wordStartTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<any>(null);

  // Sync initial targetText
  useEffect(() => {
    const initialWords = targetText.split(/\s+/).filter((w) => w.length > 0);
    setWords(initialWords);
    resetEngine();
  }, [targetText, duration, mode]);

  // Reset engine
  const resetEngine = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setCurrentWordIndex(0);
    setCurrentInput('');
    setHistory([]);
    setIsActive(false);
    setIsFinished(false);
    setTimeLeft(duration);
    setElapsedSeconds(0);
    totalTypedCharsRef.current = 0;
    wordPerformancesRef.current = [];
    timelineRef.current = [];
    wordStartTimeRef.current = 0;
  }, [duration]);

  // Infinite word appending: whenever user is within 35 words of the end in time/zen mode
  useEffect(() => {
    if ((mode === 'time' || mode === 'zen') && currentWordIndex >= words.length - 35) {
      const moreWords = getRandomWords(100, punctuation, numbers);
      setWords((prev) => [...prev, ...moreWords]);
    }
  }, [currentWordIndex, words.length, mode, punctuation, numbers]);

  // Calculate current exact correct characters across all completed words + current word
  const calculateMetrics = useCallback(
    (timeInSeconds: number) => {
      let correctChars = 0;

      // 1. Check all completed words
      for (let i = 0; i < history.length; i++) {
        const typed = history[i] || '';
        const target = words[i] || '';
        const minLen = Math.min(typed.length, target.length);

        for (let j = 0; j < minLen; j++) {
          if (typed[j] === target[j]) {
            correctChars++;
          }
        }

        // If whole word matched target word, add 1 for the space keypress
        if (typed === target) {
          correctChars += 1;
        }
      }

      // 2. Check currently active word
      const currentTarget = words[currentWordIndex] || '';
      const currentMinLen = Math.min(currentInput.length, currentTarget.length);
      for (let j = 0; j < currentMinLen; j++) {
        if (currentInput[j] === currentTarget[j]) {
          correctChars++;
        }
      }

      const totalTyped = totalTypedCharsRef.current;
      const incorrectChars = Math.max(0, totalTyped - correctChars);
      const minutes = Math.max(0.01, timeInSeconds / 60);

      const wpm = Number(((correctChars / 5) / minutes).toFixed(1));
      const rawWpm = Number(((totalTyped / 5) / minutes).toFixed(1));
      const accuracy = totalTyped > 0 ? Number(((correctChars / totalTyped) * 100).toFixed(1)) : 100;

      return {
        correctChars,
        incorrectChars,
        totalTyped,
        wpm,
        rawWpm,
        accuracy,
      };
    },
    [history, words, currentWordIndex, currentInput]
  );

  // Complete test callback
  const finishTest = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsActive(false);
    setIsFinished(true);

    const actualDuration = mode === 'time' ? duration : Math.max(1, elapsedSeconds);
    const metrics = calculateMetrics(actualDuration);

    // Calculate consistency from recorded timeline WPMs
    let consistency = 85.0;
    const timeline = timelineRef.current;
    if (timeline.length > 2) {
      const wpms = timeline.map((p) => p.wpm).filter((w) => w > 0);
      if (wpms.length > 0) {
        const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
        const variance =
          wpms.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / wpms.length;
        const stdDev = Math.sqrt(variance);
        const coeffOfVar = mean > 0 ? (stdDev / mean) * 100 : 0;
        consistency = Math.max(0, Math.min(100, Number((100 - coeffOfVar).toFixed(1))));
      }
    }

    const result: TypingTestResult = {
      mode,
      duration: actualDuration,
      wordCount: history.length + (currentInput.length > 0 ? 1 : 0),
      wpm: metrics.wpm,
      rawWpm: metrics.rawWpm,
      accuracy: metrics.accuracy,
      correctCharacters: metrics.correctChars,
      incorrectCharacters: metrics.incorrectChars,
      totalCharacters: metrics.totalTyped,
      practiceTime: actualDuration,
      consistency,
      wordsData: wordPerformancesRef.current,
      timelineData: timelineRef.current,
    };

    soundEngine.playSuccess();
    onTestComplete(result);
  }, [mode, duration, elapsedSeconds, calculateMetrics, history.length, currentInput.length, onTestComplete]);

  // Main countdown & timer loop
  useEffect(() => {
    if (isActive && !isFinished) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prevElapsed) => {
          const nextElapsed = prevElapsed + 1;
          const currentMetrics = calculateMetrics(nextElapsed);

          // Record timeline point for result graph
          timelineRef.current.push({
            second: nextElapsed,
            wpm: currentMetrics.wpm,
            rawWpm: currentMetrics.rawWpm,
            errors: currentMetrics.incorrectChars,
          });

          return nextElapsed;
        });

        if (mode === 'time') {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              finishTest();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isActive, isFinished, mode, calculateMetrics, finishTest]);

  // Start test on first key
  const startTestIfNeeded = () => {
    if (!isActive && !isFinished) {
      setIsActive(true);
      wordStartTimeRef.current = Date.now();
    }
  };

  // Keyboard navigation & typing handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished) return;

    // Shortcuts
    if (e.key === 'Tab') {
      e.preventDefault();
      onRestart();
      return;
    }

    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      onNewText();
      return;
    }

    // Space key: commit current word
    if (e.key === ' ') {
      e.preventDefault();
      if (currentInput.trim().length === 0) return; // avoid empty spaces

      startTestIfNeeded();
      soundEngine.playKey(true);
      totalTypedCharsRef.current += 1; // count the space keystroke

      const targetWord = words[currentWordIndex] || '';
      const typedWord = currentInput;
      const isMistake = typedWord !== targetWord;
      const wordDuration = Math.max(100, Date.now() - wordStartTimeRef.current);

      let wordMistakesCount = 0;
      const maxLen = Math.max(typedWord.length, targetWord.length);
      for (let i = 0; i < maxLen; i++) {
        if (typedWord[i] !== targetWord[i]) {
          wordMistakesCount++;
        }
      }

      // Record word performance for Weak Words Analysis
      wordPerformancesRef.current.push({
        word: targetWord,
        typed: typedWord,
        mistakes: wordMistakesCount,
        isMistake,
        durationMs: wordDuration,
      });

      const nextIndex = currentWordIndex + 1;
      setHistory((prev) => [...prev, typedWord]);
      setCurrentInput('');
      setCurrentWordIndex(nextIndex);
      wordStartTimeRef.current = Date.now();

      // Check test completion in words mode
      if (mode === 'words' && targetWordCount && nextIndex >= targetWordCount) {
        finishTest();
      }
      return;
    }

    // Backspace key
    if (e.key === 'Backspace') {
      startTestIfNeeded();
      soundEngine.playKey();

      if (currentInput.length > 0) {
        setCurrentInput((prev) => prev.slice(0, -1));
      } else if (currentWordIndex > 0) {
        // Step back into previous word if it had errors
        const prevIndex = currentWordIndex - 1;
        const prevTyped = history[prevIndex];
        const prevTarget = words[prevIndex];

        if (prevTyped && prevTyped !== prevTarget) {
          e.preventDefault();
          setCurrentWordIndex(prevIndex);
          setCurrentInput(prevTyped);
          setHistory((prev) => prev.slice(0, prev.length - 1));
          wordPerformancesRef.current.pop();
        }
      }
      return;
    }

    // Standard character key
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      startTestIfNeeded();

      totalTypedCharsRef.current += 1; // count character keystroke

      const targetWord = words[currentWordIndex] || '';
      const nextCharIndex = currentInput.length;
      const expectedChar = targetWord[nextCharIndex];

      if (expectedChar && e.key === expectedChar) {
        soundEngine.playKey();
      } else {
        soundEngine.playError();
      }

      const nextInput = currentInput + e.key;
      setCurrentInput(nextInput);

      // In quotes or sentence mode: check if finished on last char of last word
      if (
        (mode === 'quote' || mode === 'sentence') &&
        currentWordIndex === words.length - 1 &&
        nextInput === targetWord
      ) {
        wordPerformancesRef.current.push({
          word: targetWord,
          typed: nextInput,
          mistakes: 0,
          isMistake: false,
          durationMs: Date.now() - wordStartTimeRef.current,
        });
        finishTest();
      }
    }
  };

  return {
    words,
    currentWordIndex,
    currentInput,
    history,
    isActive,
    isFinished,
    timeLeft,
    elapsedSeconds,
    handleKeyDown,
    resetEngine,
    finishTest,
  };
}

import { useState, useEffect, useRef, useCallback } from 'react';
import type { TestMode, TypingTestResult, WordPerformance, TimelinePoint } from '../types';
import { soundEngine } from '../utils/soundEngine';

interface TypingEngineProps {
  targetText: string;
  mode: TestMode;
  duration: number; // in seconds (for time mode)
  targetWordCount: number; // for words mode
  onTestComplete: (result: TypingTestResult) => void;
  onRestart: () => void;
  onNewText: () => void;
}

export function useTypingEngine({
  targetText,
  mode,
  duration,
  targetWordCount,
  onTestComplete,
  onRestart,
  onNewText,
}: TypingEngineProps) {
  // Target words breakdown
  const words = useRef<string[]>([]);
  words.current = targetText.split(/\s+/).filter((w) => w.length > 0);

  // User input state
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]); // completed typed words
  const [wordMistakes, setWordMistakes] = useState<number[]>([]); // mistake count per word

  // Timing & metrics
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Live performance stats
  const [wpm, setWpm] = useState<number>(0);
  const [rawWpm, setRawWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [correctChars, setCorrectChars] = useState<number>(0);
  const [incorrectChars, setIncorrectChars] = useState<number>(0);
  const [totalTypedChars, setTotalTypedChars] = useState<number>(0);

  // Timeline tracking
  const timelineRef = useRef<TimelinePoint[]>([]);
  const wordStartTimeRef = useRef<number>(0);
  const wordPerformancesRef = useRef<WordPerformance[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Reset engine when target text or duration changes
  const resetEngine = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setCurrentWordIndex(0);
    setCurrentInput('');
    setHistory([]);
    setWordMistakes([]);
    setIsActive(false);
    setIsFinished(false);
    setTimeLeft(duration);
    setElapsedSeconds(0);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setCorrectChars(0);
    setIncorrectChars(0);
    setTotalTypedChars(0);
    timelineRef.current = [];
    wordPerformancesRef.current = [];
    wordStartTimeRef.current = 0;
  }, [duration]);

  useEffect(() => {
    resetEngine();
  }, [targetText, duration, mode, resetEngine]);

  // Finish test callback
  const finishTest = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsActive(false);
    setIsFinished(true);

    const actualDuration = mode === 'time' ? duration : Math.max(1, elapsedSeconds);
    const elapsedMinutes = actualDuration / 60;

    const finalWpm = Number(((correctChars / 5) / elapsedMinutes).toFixed(1));
    const finalRawWpm = Number(((totalTypedChars / 5) / elapsedMinutes).toFixed(1));
    const finalAccuracy =
      totalTypedChars > 0 ? Number(((correctChars / totalTypedChars) * 100).toFixed(1)) : 100;

    // Calculate consistency based on standard deviation of timeline WPMs
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
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAccuracy,
      correctCharacters: correctChars,
      incorrectCharacters: incorrectChars,
      totalCharacters: totalTypedChars,
      practiceTime: actualDuration,
      consistency,
      wordsData: wordPerformancesRef.current,
      timelineData: timelineRef.current,
    };

    soundEngine.playSuccess();
    onTestComplete(result);
  }, [
    mode,
    duration,
    elapsedSeconds,
    correctChars,
    totalTypedChars,
    incorrectChars,
    history.length,
    currentInput.length,
    onTestComplete,
  ]);

  // Main countdown / elapsed timer loop
  useEffect(() => {
    if (isActive && !isFinished) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const nextElapsed = prev + 1;
          const currentElapsedMinutes = nextElapsed / 60;

          // Compute instantaneous WPM
          const currentWpm =
            currentElapsedMinutes > 0
              ? Number(((correctChars / 5) / currentElapsedMinutes).toFixed(1))
              : 0;
          const currentRawWpm =
            currentElapsedMinutes > 0
              ? Number(((totalTypedChars / 5) / currentElapsedMinutes).toFixed(1))
              : 0;

          setWpm(currentWpm);
          setRawWpm(currentRawWpm);

          // Record timeline point
          timelineRef.current.push({
            second: nextElapsed,
            wpm: currentWpm,
            rawWpm: currentRawWpm,
            errors: incorrectChars,
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
  }, [isActive, isFinished, mode, correctChars, totalTypedChars, incorrectChars, finishTest]);

  // Start test on first keypress
  const startTestIfNeeded = () => {
    if (!isActive && !isFinished) {
      setIsActive(true);
      wordStartTimeRef.current = Date.now();
    }
  };

  // Handle keydown from typing input
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

    // Space key: commit word
    if (e.key === ' ') {
      e.preventDefault();
      if (currentInput.trim().length === 0) return; // ignore leading spaces

      startTestIfNeeded();
      soundEngine.playKey(true);

      const targetWord = words.current[currentWordIndex] || '';
      const typedWord = currentInput;
      const wordDuration = Math.max(100, Date.now() - wordStartTimeRef.current);
      const isWordMistake = typedWord !== targetWord;

      // Count character accuracy for the word
      let wordCorrect = 0;
      let wordIncorrect = 0;
      const maxLen = Math.max(targetWord.length, typedWord.length);

      for (let i = 0; i < maxLen; i++) {
        if (i < typedWord.length && i < targetWord.length) {
          if (typedWord[i] === targetWord[i]) {
            wordCorrect++;
          } else {
            wordIncorrect++;
          }
        } else {
          wordIncorrect++;
        }
      }

      // Add 1 for the space character
      wordCorrect += 1;

      setCorrectChars((c) => c + wordCorrect);
      setIncorrectChars((inc) => inc + wordIncorrect);
      setTotalTypedChars((tot) => tot + typedWord.length + 1);

      // Record word performance for Weak Words Analysis
      wordPerformancesRef.current.push({
        word: targetWord,
        typed: typedWord,
        mistakes: wordIncorrect,
        isMistake: isWordMistake,
        durationMs: wordDuration,
      });

      // Update history and advance
      const nextWordIndex = currentWordIndex + 1;
      setHistory((prev) => [...prev, typedWord]);
      setCurrentInput('');
      setCurrentWordIndex(nextWordIndex);
      wordStartTimeRef.current = Date.now();

      // Check if finished by words or quotes
      if (mode !== 'time' && mode !== 'zen') {
        if (nextWordIndex >= words.current.length || (targetWordCount && nextWordIndex >= targetWordCount)) {
          finishTest();
        }
      }
      return;
    }

    // Backspace handling
    if (e.key === 'Backspace') {
      startTestIfNeeded();
      soundEngine.playKey();

      if (currentInput.length === 0 && currentWordIndex > 0) {
        // Option to step back into previous word if it was wrong
        const prevIndex = currentWordIndex - 1;
        const prevTyped = history[prevIndex];
        const prevTarget = words.current[prevIndex];

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

    // Standard character keypress
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      startTestIfNeeded();

      const targetWord = words.current[currentWordIndex] || '';
      const nextCharIndex = currentInput.length;
      const expectedChar = targetWord[nextCharIndex];

      if (expectedChar && e.key === expectedChar) {
        soundEngine.playKey();
      } else {
        soundEngine.playError();
        // Record mistake for this word
        setWordMistakes((prev) => {
          const arr = [...prev];
          arr[currentWordIndex] = (arr[currentWordIndex] || 0) + 1;
          return arr;
        });
      }

      // Check if this was the last character of the last word in words/quote mode
      if (
        mode !== 'time' &&
        mode !== 'zen' &&
        currentWordIndex === words.current.length - 1 &&
        nextCharIndex === targetWord.length - 1 &&
        e.key === expectedChar
      ) {
        // Last letter typed accurately!
        setCorrectChars((c) => c + 1);
        setTotalTypedChars((t) => t + 1);
        wordPerformancesRef.current.push({
          word: targetWord,
          typed: currentInput + e.key,
          mistakes: wordMistakes[currentWordIndex] || 0,
          isMistake: false,
          durationMs: Date.now() - wordStartTimeRef.current,
        });
        finishTest();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;
    const val = e.target.value;
    if (val.endsWith(' ')) return; // handled by onKeyDown
    setCurrentInput(val);
  };

  return {
    words: words.current,
    currentWordIndex,
    currentInput,
    history,
    isActive,
    isFinished,
    timeLeft,
    elapsedSeconds,
    wpm,
    rawWpm,
    accuracy,
    correctChars,
    incorrectChars,
    totalTypedChars,
    handleKeyDown,
    handleInputChange,
    resetEngine,
    finishTest,
  };
}

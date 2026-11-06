import React, { useRef, useEffect, useState } from 'react';
import {
  Clock,
  Type,
  Quote as QuoteIcon,
  AlignLeft,
  Target,
  Infinity as InfinityIcon,
  RotateCcw,
  Sparkles,
  Command,
} from 'lucide-react';
import type { TestMode, TypingTestResult } from '../../types';
import { useTypingEngine } from '../../hooks/useTypingEngine';
import { useTheme } from '../../context/ThemeContext';

interface TypingAreaProps {
  targetText: string;
  quoteInfo?: { author: string };
  mode: TestMode;
  setMode: (m: TestMode) => void;
  duration: number;
  setDuration: (d: number) => void;
  wordCount: number;
  setWordCount: (w: number) => void;
  punctuation: boolean;
  setPunctuation: (p: boolean) => void;
  numbers: boolean;
  setNumbers: (n: boolean) => void;
  onRestart: () => void;
  onNewText: () => void;
  onTestComplete: (result: TypingTestResult) => void;
  onOpenWeakWords: () => void;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  targetText,
  quoteInfo,
  mode,
  setMode,
  duration,
  setDuration,
  wordCount,
  setWordCount,
  punctuation,
  setPunctuation,
  numbers,
  setNumbers,
  onRestart,
  onNewText,
  onTestComplete,
  onOpenWeakWords,
}) => {
  const { fontSize, caretStyle } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(true);

  // Active letter reference to calculate caret position
  const activeLetterRef = useRef<HTMLSpanElement>(null);
  const [caretPos, setCaretPos] = useState<{ left: number; top: number; width: number; height: number }>({
    left: 0,
    top: 0,
    width: 2,
    height: 24,
  });

  const {
    words,
    currentWordIndex,
    currentInput,
    history,
    isActive,
    timeLeft,
    wpm,
    rawWpm,
    accuracy,
    handleKeyDown,
    handleInputChange,
  } = useTypingEngine({
    targetText,
    mode,
    duration,
    targetWordCount: wordCount,
    onTestComplete,
    onRestart,
    onNewText,
  });

  // Keep input focused
  useEffect(() => {
    inputRef.current?.focus();
  }, [targetText]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
    setIsFocused(true);
  };

  // Update smooth caret coordinates
  useEffect(() => {
    if (activeLetterRef.current && wordsContainerRef.current) {
      const parentRect = wordsContainerRef.current.getBoundingClientRect();
      const letterRect = activeLetterRef.current.getBoundingClientRect();

      setCaretPos({
        left: letterRect.left - parentRect.left,
        top: letterRect.top - parentRect.top,
        width: letterRect.width || 10,
        height: letterRect.height || 26,
      });

      // Smooth auto-scroll active line into view
      const activeWordElem = activeLetterRef.current.closest('.word-element') as HTMLElement;
      if (activeWordElem && wordsContainerRef.current) {
        const wordOffsetTop = activeWordElem.offsetTop;
        if (wordOffsetTop > 100) {
          wordsContainerRef.current.scrollTop = wordOffsetTop - 50;
        } else {
          wordsContainerRef.current.scrollTop = 0;
        }
      }
    }
  }, [currentWordIndex, currentInput]);

  // Determine font size CSS class
  const fontSizeClass =
    fontSize === 'small'
      ? 'text-lg leading-relaxed'
      : fontSize === 'large'
      ? 'text-2xl leading-loose'
      : fontSize === 'xlarge'
      ? 'text-3xl leading-loose'
      : 'text-xl leading-relaxed';

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center my-auto py-8 px-4 cursor-text select-none focus:outline-none"
    >
      {/* Invisible actual input */}
      <input
        ref={inputRef}
        type="text"
        value={currentInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="opacity-0 absolute -top-9999px left-0 h-0 w-0 pointer-events-none"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

      {/* Mode & Config Selector Bar */}
      <div className={`flex flex-wrap items-center justify-center gap-4 mb-10 transition-opacity duration-300 ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Test Mode Selector */}
        <div className="flex items-center gap-1 bg-bg-secondary p-1 rounded-xl border border-border-color/60 text-xs">
          <button
            onClick={() => setMode('time')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'time'
                ? 'bg-accent text-white shadow-sm shadow-accent/30'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Time</span>
          </button>

          <button
            onClick={() => setMode('words')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'words'
                ? 'bg-accent text-white shadow-sm shadow-accent/30'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Words</span>
          </button>

          <button
            onClick={() => setMode('quote')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'quote'
                ? 'bg-accent text-white shadow-sm shadow-accent/30'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <QuoteIcon className="w-3.5 h-3.5" />
            <span>Quote</span>
          </button>

          <button
            onClick={() => setMode('sentence')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'sentence'
                ? 'bg-accent text-white shadow-sm shadow-accent/30'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Sentence</span>
          </button>

          <button
            onClick={onOpenWeakWords}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'weak_words'
                ? 'bg-accent text-white shadow-sm shadow-accent/30'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Weak Words</span>
          </button>

          <button
            onClick={() => setMode('zen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'zen'
                ? 'bg-accent text-white shadow-sm shadow-accent/30'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <InfinityIcon className="w-3.5 h-3.5" />
            <span>Zen</span>
          </button>
        </div>

        {/* Duration / Word Count Options */}
        {mode === 'time' && (
          <div className="flex items-center gap-1 bg-bg-secondary p-1 rounded-xl border border-border-color/60 text-xs">
            {[15, 30, 60, 120].map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  duration === d
                    ? 'bg-accent text-white shadow-sm shadow-accent/30'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {d}s
              </button>
            ))}
          </div>
        )}

        {mode === 'words' && (
          <div className="flex items-center gap-1 bg-bg-secondary p-1 rounded-xl border border-border-color/60 text-xs">
            {[10, 25, 50, 100].map((w) => (
              <button
                key={w}
                onClick={() => setWordCount(w)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  wordCount === w
                    ? 'bg-accent text-white shadow-sm shadow-accent/30'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        )}

        {/* Toggles (Punctuation, Numbers) */}
        {(mode === 'time' || mode === 'words') && (
          <div className="flex items-center gap-1 bg-bg-secondary p-1 rounded-xl border border-border-color/60 text-xs">
            <button
              onClick={() => setPunctuation(!punctuation)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                punctuation
                  ? 'bg-accent/20 text-accent border border-accent/40'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              @ punctuation
            </button>
            <button
              onClick={() => setNumbers(!numbers)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                numbers
                  ? 'bg-accent/20 text-accent border border-accent/40'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              # numbers
            </button>
          </div>
        )}
      </div>

      {/* Live HUD Counters */}
      <div className="w-full flex items-center justify-between mb-4 px-2 text-sm font-mono-typing">
        <div className="flex items-center gap-4">
          {mode === 'time' ? (
            <span className="text-3xl font-bold text-accent transition-all">
              {timeLeft}
            </span>
          ) : (
            <span className="text-xl font-bold text-accent transition-all">
              {currentWordIndex} / {words.length}
            </span>
          )}
        </div>

        {isActive && (
          <div className="flex items-center gap-6 text-xs text-text-secondary animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5">
              <span className="text-text-muted">wpm:</span>
              <span className="font-bold text-text-primary text-base">{wpm}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-text-muted">raw:</span>
              <span className="font-bold text-text-primary text-base">{rawWpm}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-text-muted">acc:</span>
              <span className="font-bold text-text-primary text-base">{accuracy}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Words Typing Window */}
      <div className="relative w-full rounded-2xl bg-bg-card/40 border border-border-color/50 p-6 sm:p-8 backdrop-blur-sm min-h-[180px] max-h-[260px] overflow-hidden">
        {/* Unfocused Blur Overlay */}
        {!isFocused && (
          <div
            onClick={handleContainerClick}
            className="absolute inset-0 z-20 flex items-center justify-center bg-bg-primary/75 backdrop-blur-xs cursor-pointer animate-in fade-in duration-150"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-secondary border border-border-color text-xs text-text-secondary shadow-lg">
              <Command className="w-4 h-4 text-accent" />
              <span>Click or press any key to focus</span>
            </div>
          </div>
        )}

        {/* Words Container with Relative Position for Smooth Caret */}
        <div
          ref={wordsContainerRef}
          className={`relative max-h-[200px] overflow-hidden scroll-smooth font-mono-typing ${fontSizeClass} flex flex-wrap gap-x-3 gap-y-2 select-none`}
        >
          {/* Smooth Animated Caret */}
          {isFocused && (
            <div
              className={`pointer-events-none z-10 ${
                caretStyle === 'block'
                  ? 'caret-block'
                  : caretStyle === 'underline'
                  ? 'caret-underline'
                  : caretStyle === 'outline'
                  ? 'caret-outline'
                  : 'caret-line'
              } ${!isActive ? 'caret-blink' : ''}`}
              style={{
                transform: `translate(${caretPos.left}px, ${caretPos.top}px)`,
                width:
                  caretStyle === 'block' || caretStyle === 'outline'
                    ? `${caretPos.width}px`
                    : caretStyle === 'underline'
                    ? `${caretPos.width}px`
                    : '2.5px',
                height: `${caretPos.height}px`,
              }}
            />
          )}

          {/* Render All Words */}
          {words.map((targetWord, wordIdx) => {
            const isCompleted = wordIdx < currentWordIndex;
            const isCurrent = wordIdx === currentWordIndex;
            const isUpcoming = wordIdx > currentWordIndex;

            // 1. Completed Word
            if (isCompleted) {
              const typedWord = history[wordIdx] || '';
              const hadMistake = typedWord !== targetWord;

              return (
                <span
                  key={wordIdx}
                  className={`word-element inline-block transition-colors ${
                    hadMistake
                      ? 'text-error border-b border-error/50'
                      : 'text-text-primary/75'
                  }`}
                >
                  {targetWord}
                </span>
              );
            }

            // 2. Active Word
            if (isCurrent) {
              const inputLetters = currentInput.split('');
              const targetLetters = targetWord.split('');
              const extraLetters = inputLetters.slice(targetLetters.length);

              return (
                <span
                  key={wordIdx}
                  className="word-element inline-block relative font-medium"
                >
                  {targetLetters.map((char, charIdx) => {
                    const typedChar = inputLetters[charIdx];
                    const isTyped = typedChar !== undefined;
                    const isCorrect = isTyped && typedChar === char;
                    const isIncorrect = isTyped && typedChar !== char;
                    const isCaretHere = charIdx === inputLetters.length;

                    return (
                      <span
                        key={charIdx}
                        ref={isCaretHere ? activeLetterRef : null}
                        className={`transition-colors ${
                          isCorrect
                            ? 'text-accent font-semibold'
                            : isIncorrect
                            ? 'text-error bg-error/20 rounded-xs'
                            : 'text-text-muted'
                        }`}
                      >
                        {char}
                      </span>
                    );
                  })}

                  {/* Overtyped extra characters */}
                  {extraLetters.map((extraChar, extraIdx) => {
                    const isCaretHere =
                      targetLetters.length + extraIdx + 1 === inputLetters.length;
                    return (
                      <span
                        key={`extra-${extraIdx}`}
                        ref={isCaretHere ? activeLetterRef : null}
                        className="text-error/80 bg-error/30 rounded-xs"
                      >
                        {extraChar}
                      </span>
                    );
                  })}

                  {/* Caret anchor when input is empty or at the end */}
                  {inputLetters.length >= targetLetters.length && (
                    <span
                      ref={
                        inputLetters.length >= targetLetters.length
                          ? activeLetterRef
                          : null
                      }
                      className="inline-block w-[1px] opacity-0"
                    >
                      &nbsp;
                    </span>
                  )}
                </span>
              );
            }

            // 3. Upcoming Words
            if (isUpcoming) {
              return (
                <span
                  key={wordIdx}
                  className="word-element inline-block text-text-muted transition-colors opacity-70"
                >
                  {targetWord}
                </span>
              );
            }

            return null;
          })}
        </div>

        {/* Quote Author attribution */}
        {mode === 'quote' && quoteInfo && (
          <div className="mt-4 pt-3 border-t border-border-color/40 text-right text-xs text-text-secondary italic">
            — {quoteInfo.author}
          </div>
        )}
      </div>

      {/* Action Buttons & Shortcut Hints Footer */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs text-text-muted">
        <div className="flex items-center gap-3">
          <button
            onClick={onRestart}
            title="Restart Test (Tab)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-secondary hover:bg-bg-card hover:text-text-primary border border-border-color/60 transition-all text-text-secondary"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>

          <button
            onClick={onNewText}
            title="New Text (Shift + Enter)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-secondary hover:bg-bg-card hover:text-text-primary border border-border-color/60 transition-all text-text-secondary"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>New Text</span>
          </button>
        </div>

        {/* Keyboard shortcut hints */}
        <div className="flex items-center gap-3 text-[11px] font-mono-typing">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-bg-secondary border border-border-color text-text-secondary">
              tab
            </kbd>{' '}
            restart
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-bg-secondary border border-border-color text-text-secondary">
              shift
            </kbd>
            +
            <kbd className="px-1.5 py-0.5 rounded bg-bg-secondary border border-border-color text-text-secondary">
              enter
            </kbd>{' '}
            new test
          </span>
        </div>
      </div>
    </div>
  );
};

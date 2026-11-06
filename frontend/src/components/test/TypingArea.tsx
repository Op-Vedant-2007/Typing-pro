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
  MousePointerClick,
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
  const { fontSize } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(true);

  const {
    words,
    currentWordIndex,
    currentInput,
    history,
    isActive,
    timeLeft,
    handleKeyDown,
  } = useTypingEngine({
    targetText,
    mode,
    duration,
    targetWordCount: wordCount,
    punctuation,
    numbers,
    onTestComplete,
    onRestart,
    onNewText,
  });

  // Keep input focused automatically
  useEffect(() => {
    inputRef.current?.focus();
  }, [targetText]);

  // Global keydown refocus so user can type anytime
  useEffect(() => {
    const handleGlobalKeyDown = () => {
      // Don't steal focus if typing in an input/textarea elsewhere
      if (
        document.activeElement &&
        (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA') &&
        document.activeElement !== inputRef.current
      ) {
        return;
      }

      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
        setIsFocused(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleContainerClick = () => {
    inputRef.current?.focus();
    setIsFocused(true);
  };

  // Smooth auto-scroll active line to keep current line visible
  useEffect(() => {
    if (activeWordRef.current && wordsContainerRef.current) {
      const container = wordsContainerRef.current;
      const activeWord = activeWordRef.current;
      const offsetTop = activeWord.offsetTop;

      // When word is beyond line 1, scroll smoothly
      if (offsetTop > 60) {
        container.scrollTop = offsetTop - 45;
      } else {
        container.scrollTop = 0;
      }
    }
  }, [currentWordIndex]);

  // Font size classes
  const fontSizeClass =
    fontSize === 'small'
      ? 'text-lg leading-loose'
      : fontSize === 'medium'
      ? 'text-xl leading-loose'
      : fontSize === 'xlarge'
      ? 'text-3xl leading-loose'
      : 'text-2xl leading-loose';

  return (
    <div
      onClick={handleContainerClick}
      className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center my-auto py-8 px-4 cursor-text select-none focus:outline-none"
    >
      {/* Hidden input catching keystrokes */}
      <input
        ref={inputRef}
        type="text"
        value=""
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="opacity-0 absolute -top-[9999px] left-0 h-0 w-0 pointer-events-none"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

      {/* Mode & Config Selector Bar (Monkeytype style) */}
      <div
        className={`flex flex-wrap items-center justify-center gap-4 mb-8 transition-opacity duration-200 ${
          isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Test Mode Selector */}
        <div className="flex items-center gap-1 bg-[#2c2e31] p-1 rounded-xl text-xs">
          <button
            onClick={() => setMode('time')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'time'
                ? 'bg-[#e2b714] text-[#323437] font-bold shadow-sm'
                : 'text-[#646669] hover:text-[#d1d0c5]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>time</span>
          </button>

          <button
            onClick={() => setMode('words')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'words'
                ? 'bg-[#e2b714] text-[#323437] font-bold shadow-sm'
                : 'text-[#646669] hover:text-[#d1d0c5]'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>words</span>
          </button>

          <button
            onClick={() => setMode('quote')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'quote'
                ? 'bg-[#e2b714] text-[#323437] font-bold shadow-sm'
                : 'text-[#646669] hover:text-[#d1d0c5]'
            }`}
          >
            <QuoteIcon className="w-3.5 h-3.5" />
            <span>quote</span>
          </button>

          <button
            onClick={() => setMode('sentence')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'sentence'
                ? 'bg-[#e2b714] text-[#323437] font-bold shadow-sm'
                : 'text-[#646669] hover:text-[#d1d0c5]'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>sentence</span>
          </button>

          <button
            onClick={onOpenWeakWords}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'weak_words'
                ? 'bg-[#e2b714] text-[#323437] font-bold shadow-sm'
                : 'text-[#e2b714]/80 hover:text-[#e2b714]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>weak words</span>
          </button>

          <button
            onClick={() => setMode('zen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'zen'
                ? 'bg-[#e2b714] text-[#323437] font-bold shadow-sm'
                : 'text-[#646669] hover:text-[#d1d0c5]'
            }`}
          >
            <InfinityIcon className="w-3.5 h-3.5" />
            <span>zen</span>
          </button>
        </div>

        {/* Duration / Word Count Options */}
        {mode === 'time' && (
          <div className="flex items-center gap-1 bg-[#2c2e31] p-1 rounded-xl text-xs">
            {[15, 30, 60, 120].map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  duration === d
                    ? 'bg-[#e2b714] text-[#323437] font-bold shadow-sm'
                    : 'text-[#646669] hover:text-[#d1d0c5]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {mode === 'words' && (
          <div className="flex items-center gap-1 bg-[#2c2e31] p-1 rounded-xl text-xs">
            {[10, 25, 50, 100].map((w) => (
              <button
                key={w}
                onClick={() => setWordCount(w)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  wordCount === w
                    ? 'bg-[#e2b714] text-[#323437] font-bold shadow-sm'
                    : 'text-[#646669] hover:text-[#d1d0c5]'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        )}

        {/* Punctuation & Numbers Toggles */}
        {(mode === 'time' || mode === 'words') && (
          <div className="flex items-center gap-1 bg-[#2c2e31] p-1 rounded-xl text-xs">
            <button
              onClick={() => setPunctuation(!punctuation)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                punctuation
                  ? 'text-[#e2b714] font-bold'
                  : 'text-[#646669] hover:text-[#d1d0c5]'
              }`}
            >
              punctuation
            </button>
            <button
              onClick={() => setNumbers(!numbers)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                numbers
                  ? 'text-[#e2b714] font-bold'
                  : 'text-[#646669] hover:text-[#d1d0c5]'
              }`}
            >
              numbers
            </button>
          </div>
        )}
      </div>

      {/* Countdown Timer or Word Progress (No real-time speed clutter!) */}
      <div className="w-full flex items-center justify-start mb-3 px-3 font-mono-typing">
        {mode === 'time' ? (
          <span className="text-3xl font-bold text-[#e2b714] tracking-tight transition-all">
            {timeLeft}
          </span>
        ) : (
          <span className="text-xl font-bold text-[#e2b714] tracking-tight transition-all">
            {currentWordIndex} / {wordCount || words.length}
          </span>
        )}
      </div>

      {/* Main Typing Area - 3 visible lines with smooth auto-scroll */}
      <div className="w-full relative py-2">
        <div
          ref={wordsContainerRef}
          className={`h-[150px] overflow-hidden scroll-smooth font-mono-typing ${fontSizeClass} flex flex-wrap gap-x-3 gap-y-1.5 select-none transition-all`}
        >
          {words.map((targetWord, wordIdx) => {
            const isCompleted = wordIdx < currentWordIndex;
            const isCurrent = wordIdx === currentWordIndex;
            const isUpcoming = wordIdx > currentWordIndex;

            // 1. Completed Word
            if (isCompleted) {
              const typedWord = history[wordIdx] || '';
              const targetLetters = targetWord.split('');
              const typedLetters = typedWord.split('');

              return (
                <div key={wordIdx} className="inline-block whitespace-nowrap">
                  {targetLetters.map((char, charIdx) => {
                    const typedChar = typedLetters[charIdx];
                    const isCorrect = typedChar !== undefined && typedChar === char;

                    return (
                      <span
                        key={charIdx}
                        className={isCorrect ? 'text-[#d1d0c5]' : 'text-[#ca4754]'}
                      >
                        {char}
                      </span>
                    );
                  })}
                  {/* Extra letters typed beyond target word */}
                  {typedLetters.slice(targetLetters.length).map((extraChar, extraIdx) => (
                    <span
                      key={`extra-${extraIdx}`}
                      className="text-[#7e2a33] underline decoration-[#ca4754]"
                    >
                      {extraChar}
                    </span>
                  ))}
                </div>
              );
            }

            // 2. Active Word Currently Being Typed
            if (isCurrent) {
              const targetLetters = targetWord.split('');
              const inputLetters = currentInput.split('');
              const extraLetters = inputLetters.slice(targetLetters.length);

              return (
                <div
                  key={wordIdx}
                  ref={activeWordRef}
                  className="inline-block whitespace-nowrap"
                >
                  {targetLetters.map((char, charIdx) => {
                    const typedChar = inputLetters[charIdx];
                    const isTyped = typedChar !== undefined;
                    const isCorrect = isTyped && typedChar === char;
                    const isIncorrect = isTyped && typedChar !== char;
                    const isCurrentLetter = charIdx === inputLetters.length;

                    return (
                      <span
                        key={charIdx}
                        className={`transition-colors ${
                          isCorrect
                            ? 'text-[#d1d0c5]'
                            : isIncorrect
                            ? 'text-[#ca4754] bg-[#ca4754]/20 rounded-xs'
                            : isCurrentLetter
                            ? 'text-[#646669] border-b-2 border-[#e2b714]'
                            : 'text-[#646669]'
                        }`}
                      >
                        {char}
                      </span>
                    );
                  })}

                  {/* Overtyped extra characters */}
                  {extraLetters.map((extraChar, extraIdx) => (
                    <span
                      key={`extra-${extraIdx}`}
                      className="text-[#7e2a33] bg-[#7e2a33]/25 border-b-2 border-[#ca4754]"
                    >
                      {extraChar}
                    </span>
                  ))}

                  {/* Underline on space if cursor is at the end of word */}
                  {inputLetters.length >= targetLetters.length && (
                    <span className="border-b-2 border-[#e2b714] inline-block w-2">
                      &nbsp;
                    </span>
                  )}
                </div>
              );
            }

            // 3. Upcoming Words (Muted gray)
            if (isUpcoming) {
              return (
                <div key={wordIdx} className="inline-block whitespace-nowrap text-[#646669]">
                  {targetWord}
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Quote Author attribution */}
        {mode === 'quote' && quoteInfo && (
          <div className="mt-3 text-right text-xs text-[#646669] italic">
            — {quoteInfo.author}
          </div>
        )}
      </div>

      {/* Subtle Unfocused Indicator Below Text (Never blocking the words!) */}
      {!isFocused && (
        <div
          onClick={handleContainerClick}
          className="mt-3 py-1 px-3 rounded-lg bg-[#2c2e31] text-xs text-[#e2b714] flex items-center gap-1.5 cursor-pointer animate-pulse"
        >
          <MousePointerClick className="w-3.5 h-3.5" />
          <span>Click here or press any key to focus</span>
        </div>
      )}

      {/* Action Buttons & Shortcut Hints Footer */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 text-xs text-[#646669]">
        <div className="flex items-center gap-3">
          <button
            onClick={onRestart}
            title="Restart Test (Tab)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2c2e31] hover:text-[#d1d0c5] transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>restart</span>
          </button>

          <button
            onClick={onNewText}
            title="New Text (Shift + Enter)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2c2e31] hover:text-[#d1d0c5] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e2b714]" />
            <span>new text</span>
          </button>
        </div>

        {/* Keyboard shortcut hints */}
        <div className="flex items-center gap-3 text-[11px] font-mono-typing">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-[#2c2e31] text-[#646669]">
              tab
            </kbd>{' '}
            restart
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-[#2c2e31] text-[#646669]">
              shift
            </kbd>
            +
            <kbd className="px-1.5 py-0.5 rounded bg-[#2c2e31] text-[#646669]">
              enter
            </kbd>{' '}
            new test
          </span>
        </div>
      </div>
    </div>
  );
};

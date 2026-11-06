import React, { useState } from 'react';
import {
  Palette,
  Volume2,
  VolumeX,
  Type,
  Sliders,
  Keyboard,
  Check,
  Play,
} from 'lucide-react';
import { useTheme, AVAILABLE_THEMES } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { soundEngine } from '../../utils/soundEngine';

export const SettingsView: React.FC = () => {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
  } = useTheme();

  const { settings, updateSettings } = useAuth();

  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings?.soundEnabled ?? true);
  const [soundTheme, setSoundTheme] = useState<string>(settings?.soundTheme ?? 'mechanical');
  const [preferredDuration, setPreferredDuration] = useState<number>(settings?.preferredTestDuration ?? 30);
  const [preferredWordCount, setPreferredWordCount] = useState<number>(settings?.preferredWordCount ?? 25);
  const [preferredMode, setPreferredMode] = useState<string>(settings?.preferredMode ?? 'time');

  const handleSoundToggle = (val: boolean) => {
    setSoundEnabled(val);
    soundEngine.setEnabled(val);
    if (settings) updateSettings({ soundEnabled: val });
  };

  const handleSoundThemeChange = (newTheme: string) => {
    setSoundTheme(newTheme);
    soundEngine.setTheme(newTheme);
    soundEngine.playKey();
    if (settings) updateSettings({ soundTheme: newTheme });
  };

  const handleTestSound = () => {
    soundEngine.playKey();
  };

  const handleDurationChange = (dur: number) => {
    setPreferredDuration(dur);
    if (settings) updateSettings({ preferredTestDuration: dur });
  };

  const handleWordCountChange = (count: number) => {
    setPreferredWordCount(count);
    if (settings) updateSettings({ preferredWordCount: count });
  };

  const handleModeChange = (m: string) => {
    setPreferredMode(m);
    if (settings) updateSettings({ preferredMode: m });
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#d1d0c5]">
          Settings & Customization
        </h1>
        <p className="text-xs text-[#646669] mt-1">
          Personalize themes, sound synthesis, typography, and test preferences
        </p>
      </div>

      <div className="space-y-8">
        {/* 1. Theme Selection */}
        <section className="bg-[#2c2e31] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-[#e2b714]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#d1d0c5]">
              Theme Palette
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {AVAILABLE_THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`relative flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left group ${
                  theme === t.id
                    ? 'border-[#e2b714] bg-[#e2b714]/10 shadow-sm'
                    : 'border-[#3e4145] bg-[#323437] hover:border-[#646669]'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg shrink-0 border border-white/20 flex items-center justify-center shadow-inner"
                  style={{ backgroundColor: t.bg }}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: t.accent }}
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-[#d1d0c5] truncate">
                    {t.name}
                  </span>
                  <span className="text-[10px] text-[#646669] font-mono">
                    {t.id}
                  </span>
                </div>
                {theme === t.id && (
                  <Check className="w-4 h-4 text-[#e2b714] ml-auto shrink-0" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* 2. Typography */}
        <section className="bg-[#2c2e31] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-[#e2b714]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#d1d0c5]">
              Typography & Font Size
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Font Family */}
            <div>
              <label className="block text-xs font-medium text-[#646669] mb-2">
                Monospace Font
              </label>
              <div className="space-y-1.5">
                {['Roboto Mono', 'JetBrains Mono', 'Fira Code'].map((font) => (
                  <button
                    key={font}
                    onClick={() => setFontFamily(font)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-mono border text-left transition-all flex items-center justify-between ${
                      fontFamily === font
                        ? 'bg-[#e2b714]/15 border-[#e2b714] text-[#e2b714] font-bold'
                        : 'bg-[#323437] border-[#3e4145] text-[#646669] hover:text-[#d1d0c5]'
                    }`}
                  >
                    <span>{font}</span>
                    {fontFamily === font && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-xs font-medium text-[#646669] mb-2">
                Font Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'small', label: 'Small (18px)' },
                  { id: 'medium', label: 'Medium (20px)' },
                  { id: 'large', label: 'Large (24px - standard)' },
                  { id: 'xlarge', label: 'X-Large (28px)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setFontSize(s.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs border text-center transition-all ${
                      fontSize === s.id
                        ? 'bg-[#e2b714] text-[#323437] border-[#e2b714] font-bold'
                        : 'bg-[#323437] border-[#3e4145] text-[#646669] hover:text-[#d1d0c5]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Audio & Sound Effects */}
        <section className="bg-[#2c2e31] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-[#e2b714]" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#d1d0c5]">
                Keyboard Sound Effects
              </h2>
            </div>

            <button
              onClick={() => handleSoundToggle(!soundEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                soundEnabled
                  ? 'bg-[#e2b714]/20 border-[#e2b714] text-[#e2b714]'
                  : 'bg-[#323437] border-[#3e4145] text-[#646669]'
              }`}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Audio Enabled</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Audio Muted</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'mechanical', name: 'Tactile Switch', desc: 'Crisp Cherry MX click' },
              { id: 'typewriter', name: 'Typewriter', desc: 'Metallic vintage clack' },
              { id: 'pop', name: 'Soft Pop', desc: 'Gentle bubble sound' },
              { id: 'mute', name: 'Mute', desc: 'Completely silent' },
            ].map((snd) => (
              <button
                key={snd.id}
                onClick={() => handleSoundThemeChange(snd.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  soundTheme === snd.id
                    ? 'border-[#e2b714] bg-[#e2b714]/10 shadow-xs'
                    : 'border-[#3e4145] bg-[#323437] hover:border-[#646669]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#d1d0c5]">
                    {snd.name}
                  </span>
                  {soundTheme === snd.id && <Check className="w-3.5 h-3.5 text-[#e2b714]" />}
                </div>
                <span className="text-[11px] text-[#646669] block">{snd.desc}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[#3e4145]/50 flex items-center justify-between">
            <span className="text-xs text-[#646669]">
              Synthesized in real-time via Web Audio API (Zero lag)
            </span>
            <button
              type="button"
              onClick={handleTestSound}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#323437] hover:text-[#d1d0c5] border border-[#3e4145] text-xs text-[#646669] transition-colors"
            >
              <Play className="w-3 h-3 text-[#e2b714]" />
              <span>Test Keystroke</span>
            </button>
          </div>
        </section>

        {/* 4. Default Test Preferences */}
        <section className="bg-[#2c2e31] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="w-5 h-5 text-[#e2b714]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#d1d0c5]">
              Default Test Preferences
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Preferred Mode */}
            <div>
              <label className="block text-xs font-medium text-[#646669] mb-2">
                Preferred Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['time', 'words', 'quote', 'sentence'].map((m) => (
                  <button
                    key={m}
                    onClick={() => handleModeChange(m)}
                    className={`py-1.5 px-2 rounded-lg text-xs capitalize border transition-all ${
                      preferredMode === m
                        ? 'bg-[#e2b714] text-[#323437] border-[#e2b714] font-bold'
                        : 'bg-[#323437] border-[#3e4145] text-[#646669] hover:text-[#d1d0c5]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Duration */}
            <div>
              <label className="block text-xs font-medium text-[#646669] mb-2">
                Preferred Duration (Time Mode)
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[15, 30, 60, 120].map((dur) => (
                  <button
                    key={dur}
                    onClick={() => handleDurationChange(dur)}
                    className={`py-1.5 px-1 rounded-lg text-xs font-mono font-semibold border transition-all ${
                      preferredDuration === dur
                        ? 'bg-[#e2b714] text-[#323437] border-[#e2b714] font-bold'
                        : 'bg-[#323437] border-[#3e4145] text-[#646669] hover:text-[#d1d0c5]'
                    }`}
                  >
                    {dur}s
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Word Count */}
            <div>
              <label className="block text-xs font-medium text-[#646669] mb-2">
                Preferred Word Count (Words Mode)
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 25, 50, 100].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => handleWordCountChange(cnt)}
                    className={`py-1.5 px-1 rounded-lg text-xs font-mono font-semibold border transition-all ${
                      preferredWordCount === cnt
                        ? 'bg-[#e2b714] text-[#323437] border-[#e2b714] font-bold'
                        : 'bg-[#323437] border-[#3e4145] text-[#646669] hover:text-[#d1d0c5]'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. Keyboard Shortcuts Reference */}
        <section className="bg-[#2c2e31] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Keyboard className="w-5 h-5 text-[#e2b714]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#d1d0c5]">
              Keyboard Shortcuts Reference
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#323437] border border-[#3e4145]">
              <span className="text-[#646669]">Restart Current Test</span>
              <kbd className="px-2 py-0.5 rounded bg-[#2c2e31] border border-[#3e4145] text-[#e2b714] font-mono">
                Tab
              </kbd>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#323437] border border-[#3e4145]">
              <span className="text-[#646669]">Generate New Text</span>
              <kbd className="px-2 py-0.5 rounded bg-[#2c2e31] border border-[#3e4145] text-[#e2b714] font-mono">
                Shift + Enter
              </kbd>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#323437] border border-[#3e4145]">
              <span className="text-[#646669]">Start or Confirm Result</span>
              <kbd className="px-2 py-0.5 rounded bg-[#2c2e31] border border-[#3e4145] text-[#e2b714] font-mono">
                Enter
              </kbd>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#323437] border border-[#3e4145]">
              <span className="text-[#646669]">Exit Modal / Custom Screen</span>
              <kbd className="px-2 py-0.5 rounded bg-[#2c2e31] border border-[#3e4145] text-[#e2b714] font-mono">
                Esc
              </kbd>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#323437] border border-[#3e4145]">
              <span className="text-[#646669]">Quick Open Settings</span>
              <kbd className="px-2 py-0.5 rounded bg-[#2c2e31] border border-[#3e4145] text-[#e2b714] font-mono">
                Ctrl + Shift + P
              </kbd>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#323437] border border-[#3e4145]">
              <span className="text-[#646669]">Targeted Weak Words Practice</span>
              <kbd className="px-2 py-0.5 rounded bg-[#2c2e31] border border-[#3e4145] text-[#e2b714] font-mono">
                Ctrl + Shift + W
              </kbd>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

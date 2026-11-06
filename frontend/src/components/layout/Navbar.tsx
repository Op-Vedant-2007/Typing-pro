import React from 'react';
import {
  Keyboard,
  Target,
  BarChart3,
  History,
  Settings,
  User as UserIcon,
  LogOut,
  Zap,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { soundEngine } from '../../utils/soundEngine';

interface NavbarProps {
  currentTab: 'test' | 'weakwords' | 'analytics' | 'history' | 'settings';
  onSelectTab: (tab: 'test' | 'weakwords' | 'analytics' | 'history' | 'settings') => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuth,
  onOpenProfile,
}) => {
  const { user, isDemo, logout, settings, updateSettings } = useAuth();

  const toggleSound = () => {
    if (settings) {
      const nextSound = !settings.soundEnabled;
      soundEngine.setEnabled(nextSound);
      updateSettings({ soundEnabled: nextSound });
    }
  };

  return (
    <header className="w-full max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#3e4145]/40">
      {/* Brand Logo */}
      <div
        onClick={() => onSelectTab('test')}
        className="flex items-center gap-3 cursor-pointer group select-none"
      >
        <div className="w-9 h-9 rounded-lg bg-[#e2b714] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-150">
          <Keyboard className="w-5 h-5 text-[#323437]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold tracking-tight text-[#d1d0c5] font-mono-typing">
              Type<span className="text-[#e2b714]">Flow</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#e2b714]/15 text-[#e2b714] border border-[#e2b714]/30">
              Pro
            </span>
          </div>
          <span className="text-[10px] text-[#646669] tracking-wide">
            Intelligent Typing Practice
          </span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-[#2c2e31] p-1 rounded-xl">
        <button
          onClick={() => onSelectTab('test')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'test'
              ? 'bg-[#e2b714] text-[#323437] font-bold shadow-sm'
              : 'text-[#646669] hover:text-[#d1d0c5]'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          <span>practice</span>
        </button>

        <button
          onClick={() => onSelectTab('weakwords')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'weakwords'
              ? 'bg-[#e2b714] text-[#323437] font-bold shadow-sm'
              : 'text-[#646669] hover:text-[#d1d0c5]'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>weak words</span>
        </button>

        <button
          onClick={() => onSelectTab('analytics')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'analytics'
              ? 'bg-[#e2b714] text-[#323437] font-bold shadow-sm'
              : 'text-[#646669] hover:text-[#d1d0c5]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>analytics</span>
        </button>

        <button
          onClick={() => onSelectTab('history')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'history'
              ? 'bg-[#e2b714] text-[#323437] font-bold shadow-sm'
              : 'text-[#646669] hover:text-[#d1d0c5]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>history</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'settings'
              ? 'bg-[#e2b714] text-[#323437] font-bold shadow-sm'
              : 'text-[#646669] hover:text-[#d1d0c5]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>settings</span>
        </button>
      </nav>

      {/* Right User Actions */}
      <div className="flex items-center gap-2">
        {/* Sound toggle button */}
        <button
          onClick={toggleSound}
          title={settings?.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          className="p-2 rounded-lg text-[#646669] hover:text-[#d1d0c5] hover:bg-[#2c2e31] transition-colors"
        >
          {settings?.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[#e2b714]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#646669]" />
          )}
        </button>

        {user ? (
          <div className="flex items-center gap-2">
            {isDemo && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#e2b714]/15 text-[#e2b714] border border-[#e2b714]/30">
                <Zap className="w-3 h-3" /> demo
              </span>
            )}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2c2e31] hover:text-[#d1d0c5] text-xs font-medium transition-all text-[#646669]"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#e2b714]" />
              <span className="max-w-[90px] truncate">{user.name}</span>
            </button>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg text-[#646669] hover:text-[#ca4754] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e2b714] text-[#323437] hover:bg-[#f1c933] text-xs font-bold transition-all shadow-sm"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>sign in</span>
          </button>
        )}
      </div>
    </header>
  );
};

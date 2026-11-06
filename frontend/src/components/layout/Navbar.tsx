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
    <header className="w-full max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-border-color/40">
      {/* Brand Logo */}
      <div
        onClick={() => onSelectTab('test')}
        className="flex items-center gap-3 cursor-pointer group select-none"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/80 to-accent flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform duration-200">
          <Keyboard className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold tracking-tight text-primary font-mono-typing">
              Type<span className="text-accent">Flow</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
              Pro
            </span>
          </div>
          <span className="text-[11px] text-text-secondary tracking-wide">
            Intelligent Typing & Learning
          </span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-bg-secondary/70 p-1 rounded-xl border border-border-color/50 backdrop-blur-sm">
        <button
          onClick={() => onSelectTab('test')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'test'
              ? 'bg-accent text-white shadow-md shadow-accent/25'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          <span>Practice</span>
        </button>

        <button
          onClick={() => onSelectTab('weakwords')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'weakwords'
              ? 'bg-accent text-white shadow-md shadow-accent/25'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Weak Words</span>
        </button>

        <button
          onClick={() => onSelectTab('analytics')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'analytics'
              ? 'bg-accent text-white shadow-md shadow-accent/25'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => onSelectTab('history')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'history'
              ? 'bg-accent text-white shadow-md shadow-accent/25'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
          }`}
        >
          <History className="w-4 h-4" />
          <span>History</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'settings'
              ? 'bg-accent text-white shadow-md shadow-accent/25'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </nav>

      {/* Right User Actions */}
      <div className="flex items-center gap-3">
        {/* Sound toggle button */}
        <button
          onClick={toggleSound}
          title={settings?.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
        >
          {settings?.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-accent" />
          ) : (
            <VolumeX className="w-4 h-4 text-text-muted" />
          )}
        </button>

        {user ? (
          <div className="flex items-center gap-2">
            {isDemo && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Zap className="w-3 h-3" /> Demo Mode
              </span>
            )}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-secondary hover:bg-bg-card border border-border-color/60 text-xs font-medium transition-all"
            >
              <UserIcon className="w-3.5 h-3.5 text-accent" />
              <span className="max-w-[100px] truncate">{user.name}</span>
            </button>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg text-text-secondary hover:text-error hover:bg-error/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover text-xs font-medium shadow-md shadow-accent/20 transition-all"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};

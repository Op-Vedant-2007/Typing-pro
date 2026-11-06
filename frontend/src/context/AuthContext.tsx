import { apiUrl } from '../utils/api';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserSettings } from '../types';
import { soundEngine } from '../utils/soundEngine';

interface AuthContextType {
  user: User | null;
  settings: UserSettings | null;
  token: string | null;
  isLoading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<UserSettings>;
  updateProfile: (data: { name?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('typeflow_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isDemo = Boolean(user && user.email === 'demo@typeflow.app');

  useEffect(() => {
    if (token) {
      fetchMe(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  // Sync sound settings with soundEngine
  useEffect(() => {
    if (settings) {
      soundEngine.setEnabled(settings.soundEnabled);
      soundEngine.setTheme(settings.soundTheme);
    }
  }, [settings]);

  const fetchMe = async (authToken: string) => {
    try {
      const res = await fetch(apiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSettings(data.settings);
      } else {
        localStorage.removeItem('typeflow_token');
        setToken(null);
        setUser(null);
      }
    } catch {
      // Offline / server unreachable
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to login');
    }

    localStorage.setItem('typeflow_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setSettings(data.settings);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch(apiUrl('/api/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to register');
    }

    localStorage.setItem('typeflow_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setSettings(data.settings);
  };

  const demoLogin = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/demo'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize demo');
      }

      localStorage.setItem('typeflow_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setSettings(data.settings);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('typeflow_token');
    setToken(null);
    setUser(null);
    setSettings(null);
  };

  const updateSettings = async (newSettings: Partial<UserSettings>): Promise<UserSettings> => {
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(apiUrl('/api/user/settings'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newSettings),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update settings');
    }

    setSettings(data);
    return data;
  };

  const updateProfile = async (data: { name?: string; currentPassword?: string; newPassword?: string }) => {
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(apiUrl('/api/user/profile'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error || 'Failed to update profile');
    }

    setUser(resData.user);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchMe(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        settings,
        token,
        isLoading,
        isDemo,
        login,
        register,
        demoLogin,
        logout,
        updateSettings,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

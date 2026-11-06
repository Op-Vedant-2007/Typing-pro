import React, { useState } from 'react';
import { X, User as UserIcon, CheckCircle2, Loader2, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, isDemo, updateProfile } = useAuth();
  const [name, setName] = useState<string>(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!isOpen || !user) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSaving(true);

    try {
      await updateProfile({
        name,
        ...(newPassword ? { currentPassword, newPassword } : {}),
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-bg-card rounded-2xl border border-border-color shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">{user.name}</h2>
            <p className="text-xs text-text-secondary">{user.email}</p>
          </div>
        </div>

        {/* Member info banner */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-bg-secondary border border-border-color/60 text-xs text-text-secondary mb-5">
          <Calendar className="w-4 h-4 text-accent" />
          <span>Member since {formattedDate}</span>
          {isDemo && (
            <span className="ml-auto text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
              Demo Account
            </span>
          )}
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-xs flex items-center gap-2 border ${
              message.type === 'success'
                ? 'bg-success/10 border-success/30 text-success'
                : 'bg-error/10 border-error/30 text-error'
            }`}
          >
            {message.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Update Profile Form */}
        <form onSubmit={handleUpdate} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-bg-secondary border border-border-color rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="pt-2 border-t border-border-color/50">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Change Password (Optional)
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Current Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-bg-secondary border border-border-color rounded-xl px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-bg-secondary border border-border-color rounded-xl px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-accent text-white hover:bg-accent-hover text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-accent/25 transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving changes...</span>
              </>
            ) : (
              <span>Save Profile Changes</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

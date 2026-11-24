'use client';

import React, { useState } from 'react';
import { useAuth, STRONG_DEFAULT_ADMIN } from '@/context/AuthContext';
import { Shield, Lock, KeyRound, Eye, EyeOff, AlertCircle, Sparkles, X } from 'lucide-react';

export function AdminLoginModal() {
  const { isAdminLoginModalOpen, setIsAdminLoginModalOpen, adminLoginWithCredentials, adminEmails } = useAuth();

  const [authMode, setAuthMode] = useState<'PASSWORD' | 'PASSCODE'>('PASSWORD');
  const [email, setEmail] = useState(STRONG_DEFAULT_ADMIN.email);
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAdminLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await adminLoginWithCredentials(
      email,
      authMode === 'PASSWORD' ? password : undefined,
      authMode === 'PASSCODE' ? passcode : undefined
    );

    if (!res.success) {
      setErrorMsg(res.error || 'Authentication failed. Please check credentials.');
    }
    setIsSubmitting(false);
  };

  const handleQuickFill = () => {
    setEmail(STRONG_DEFAULT_ADMIN.email);
    setPassword(STRONG_DEFAULT_ADMIN.password);
    setPasscode(STRONG_DEFAULT_ADMIN.counterPasscode);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-night-card border border-amber-electric/40 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={() => setIsAdminLoginModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-electric/15 border border-amber-electric/30 text-amber-electric rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white">Mess Counter Admin Login</h3>
            <p className="text-xs text-zinc-400">Restricted Staff &amp; Kitchen Portal</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-night-black border border-night-border rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAuthMode('PASSWORD')}
            className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              authMode === 'PASSWORD' ? 'bg-amber-electric text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Strong Password</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('PASSCODE')}
            className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              authMode === 'PASSCODE' ? 'bg-amber-electric text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Counter PIN (8392)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Admin Email */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Admin Email ID
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@nightbite.ac.in"
              className="w-full px-3.5 py-2.5 rounded-xl bg-night-black border border-night-border text-white text-xs font-mono focus:border-amber-electric focus:outline-none"
            />
          </div>

          {/* Password Mode */}
          {authMode === 'PASSWORD' ? (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Admin Strong Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-night-black border border-night-border text-white text-xs font-mono focus:border-amber-electric focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                4-Digit Quick Counter Passcode PIN
              </label>
              <input
                type="text"
                maxLength={4}
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 8392"
                className="w-full text-center tracking-widest text-xl font-mono font-black py-2.5 rounded-xl bg-night-black border border-night-border text-white focus:border-amber-electric focus:outline-none"
              />
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-crimson-danger/20 border border-crimson-danger/40 text-xs text-crimson-danger flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-electric hover:bg-amber-glow disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all min-h-[48px]"
          >
            <Shield className="w-4 h-4" />
            <span>{isSubmitting ? 'Authenticating...' : 'Authenticate & Open Counter'}</span>
          </button>

          {/* Default Credentials Helper Card */}
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
            <div className="flex items-center justify-between font-semibold text-zinc-200">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-electric" />
                <span>Default Admin Credentials:</span>
              </span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-amber-electric hover:underline text-[10px] font-bold"
              >
                1-Tap Auto-Fill
              </button>
            </div>
            <div>
              Email: <code className="text-amber-electric font-mono">{STRONG_DEFAULT_ADMIN.email}</code>
            </div>
            <div>
              Password: <code className="text-amber-electric font-mono">{STRONG_DEFAULT_ADMIN.password}</code>
            </div>
            <div>
              PIN: <code className="text-amber-electric font-mono">{STRONG_DEFAULT_ADMIN.counterPasscode}</code>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

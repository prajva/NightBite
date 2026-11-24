'use client';

import React, { useState } from 'react';
import { useAuth, STRONG_DEFAULT_ADMIN } from '@/context/AuthContext';
import { AdminQueue } from '@/components/AdminQueue';
import { Shield, Lock, KeyRound, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminPage() {
  const { role, adminLoginWithCredentials } = useAuth();

  const [email, setEmail] = useState(STRONG_DEFAULT_ADMIN.email);
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'PASSWORD' | 'PASSCODE'>('PASSWORD');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated as admin, show the full admin counter
  if (role === 'ADMIN') {
    return (
      <div className="w-full">
        <AdminQueue />
      </div>
    );
  }

  // Otherwise, render dedicated Counter Admin Login gate
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await adminLoginWithCredentials(
      email,
      authMode === 'PASSWORD' ? password : undefined,
      authMode === 'PASSCODE' ? passcode : undefined
    );

    if (!res.success) {
      setErrorMsg(res.error || 'Invalid credentials.');
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
    <div className="max-w-md mx-auto px-4 py-8 animate-fade-in">
      <div className="bg-night-card border border-amber-electric/40 rounded-2xl p-6 sm:p-7 shadow-2xl text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-electric/15 border border-amber-electric/30 text-amber-electric rounded-xl">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-white">Mess Counter Portal</h2>
            <p className="text-xs text-zinc-400">Strictly for Night Mess Staff</p>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed mb-5">
          Access the live token queue, verify student UPI payments, trigger kitchen order alerts, and record the night ledger.
        </p>

        {/* Tab Selector */}
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
            <span>Counter PIN</span>
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-night-black border border-night-border text-white text-xs font-mono focus:border-amber-electric focus:outline-none"
            />
          </div>

          {authMode === 'PASSWORD' ? (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter strong password"
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
                4-Digit Counter Passcode PIN
              </label>
              <input
                type="text"
                maxLength={4}
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 8392"
                className="w-full text-center tracking-widest text-2xl font-mono font-black py-2.5 rounded-xl bg-night-black border border-night-border text-white focus:border-amber-electric focus:outline-none"
              />
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-crimson-danger/20 border border-crimson-danger/40 text-xs text-crimson-danger flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-electric hover:bg-amber-glow disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all min-h-[48px]"
          >
            <Shield className="w-4 h-4" />
            <span>{isSubmitting ? 'Verifying...' : 'Unlock Mess Counter'}</span>
          </button>

          {/* Quick Credential Box */}
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
              Counter PIN: <code className="text-amber-electric font-mono">{STRONG_DEFAULT_ADMIN.counterPasscode}</code>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

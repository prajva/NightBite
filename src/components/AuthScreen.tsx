'use client';

import React, { useState } from 'react';
import { useAuth, STRONG_DEFAULT_ADMIN } from '@/context/AuthContext';
import {
  Shield,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export function AuthScreen() {
  const { login, signUp, quickDemoLogin, allowedDomain, rejectionError, clearRejectionError } = useAuth();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign up form state (strictly MH-4 Block)
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [surname, setSurname] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearRejectionError();
    setIsSubmitting(true);

    const res = await login(loginEmail, loginPassword);
    if (!res.success) {
      setLocalError(res.error || 'Login failed. Please check credentials.');
    }
    setIsSubmitting(false);
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearRejectionError();
    setIsSubmitting(true);

    const res = await signUp({
      firstName,
      middleName: middleName.trim() || undefined,
      surname,
      email: signupEmail,
      roomNumber,
      password: signupPassword,
    });

    if (!res.success) {
      setLocalError(res.error || 'Registration failed. Please check details.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-8">
      <div className="max-w-sm w-full">
        {/* Minimal Uber Brand Header */}
        <div className="mb-6 text-left">
          <div className="inline-block text-[11px] font-mono tracking-wider text-peach uppercase mb-1">
            MH-4 Block • 10:30 PM - 12:00 AM IST
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Night<span className="text-peach">Bite</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Hostel Mess Late-Night Canteen
          </p>
        </div>

        {/* Auth Box */}
        <div className="bg-uber-surface border border-uber-border rounded-2xl p-5 sm:p-6 shadow-xl">
          {/* Uber Switcher */}
          <div className="grid grid-cols-2 p-1 bg-black rounded-xl border border-uber-border mb-5">
            <button
              onClick={() => {
                setActiveTab('LOGIN');
                setLocalError(null);
                clearRejectionError();
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'LOGIN'
                  ? 'bg-peach text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('SIGNUP');
                setLocalError(null);
                clearRejectionError();
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'SIGNUP'
                  ? 'bg-peach text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Banner */}
          {(localError || rejectionError) && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{localError || rejectionError}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Email or Staff ID
                </label>
                <input
                  type="text"
                  required
                  placeholder={`name.branch@${allowedDomain} or admin`}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-uber-border text-white text-xs placeholder:text-zinc-600 focus:border-peach focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Password or Counter PIN
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Password or 4-digit PIN"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-9 rounded-xl bg-black border border-uber-border text-white text-xs placeholder:text-zinc-600 focus:border-peach focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-peach hover:bg-peach-300 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all min-h-[44px] mt-1"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[10px] text-zinc-500 text-center pt-1">
                Staff ID opens the Counter Face automatically.
              </div>
            </form>
          ) : (
            /* TAB 2: SIGN UP (Strictly MH-4 Hostel Block) */
            <form onSubmit={handleSignUpSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    First Name <span className="text-peach">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kavya"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-uber-border text-white text-xs placeholder:text-zinc-600 focus:border-peach focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Middle Name <span className="text-zinc-600">(opt)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-uber-border text-white text-xs placeholder:text-zinc-600 focus:border-peach focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Surname / Last Name <span className="text-peach">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharma"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-uber-border text-white text-xs placeholder:text-zinc-600 focus:border-peach focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  VIT-AP Student Email <span className="text-peach">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder={`kavya.21bce@${allowedDomain}`}
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-uber-border text-white text-xs placeholder:text-zinc-600 focus:border-peach focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  MH-4 Room Number <span className="text-peach">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 304 or 112"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-uber-border text-white text-xs placeholder:text-zinc-600 focus:border-peach focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Password <span className="text-peach">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-9 rounded-xl bg-black border border-uber-border text-white text-xs placeholder:text-zinc-600 focus:border-peach focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-peach hover:bg-peach-300 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all min-h-[44px] mt-2"
              >
                <span>{isSubmitting ? 'Creating...' : 'Register for MH-4'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick 1-Tap Testing Pills */}
          <div className="mt-5 pt-4 border-t border-uber-border">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-peach" />
              <span>1-Tap Demo Shortcuts:</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => quickDemoLogin('student')}
                className="py-2 px-2.5 rounded-xl bg-black hover:bg-zinc-900 border border-uber-border text-left transition-colors"
              >
                <div className="text-[11px] font-semibold text-white flex items-center gap-1">
                  <User className="w-3 h-3 text-peach" />
                  <span>Student Face</span>
                </div>
                <div className="text-[9px] text-zinc-500 font-mono">
                  MH-4 Room 304
                </div>
              </button>

              <button
                onClick={() => quickDemoLogin('admin')}
                className="py-2 px-2.5 rounded-xl bg-black hover:bg-zinc-900 border border-uber-border text-left transition-colors"
              >
                <div className="text-[11px] font-semibold text-white flex items-center gap-1">
                  <Shield className="w-3 h-3 text-peach" />
                  <span>Counter Staff</span>
                </div>
                <div className="text-[9px] text-zinc-500 font-mono">
                  MH-4 Staff Face
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useAuth, STRONG_DEFAULT_ADMIN } from '@/context/AuthContext';
import {
  Shield,
  User,
  Lock,
  Mail,
  Home,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export function AuthScreen() {
  const { login, signUp, quickDemoLogin, allowedDomain, rejectionError, clearRejectionError } = useAuth();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign up form state
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [surname, setSurname] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [hostelRoom, setHostelRoom] = useState('');
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
      setLocalError(res.error || 'Login failed. Please check your credentials.');
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
      hostelRoom,
      password: signupPassword,
    });

    if (!res.success) {
      setLocalError(res.error || 'Registration failed. Please check your details.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Brand Header — Minimalist Uber Vibe */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-glow border border-peach-border mb-3">
            <span className="w-2 h-2 rounded-full bg-peach animate-pulse" />
            <span className="text-[11px] font-medium tracking-wide uppercase text-peach">
              VIT-AP Hostel Mess
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Night<span className="text-peach">Bite</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Operating strictly 10:30 PM – 12:00 AM IST
          </p>
        </div>

        {/* Auth Card — Peach & Black */}
        <div className="bg-uber-surface border border-uber-border rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Minimalist Pill Switcher */}
          <div className="grid grid-cols-2 p-1 bg-black rounded-2xl border border-uber-border mb-6">
            <button
              onClick={() => {
                setActiveTab('LOGIN');
                setLocalError(null);
                clearRejectionError();
              }}
              className={`py-2.5 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'LOGIN'
                  ? 'bg-peach text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setActiveTab('SIGNUP');
                setLocalError(null);
                clearRejectionError();
              }}
              className={`py-2.5 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'SIGNUP'
                  ? 'bg-peach text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Rejection / Validation Error Alert */}
          {(localError || rejectionError) && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{localError || rejectionError}</span>
              </div>
            </div>
          )}

          {/* TAB 1: LOG IN */}
          {activeTab === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                  Email or Admin ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={`roll.branch@${allowedDomain} or admin`}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black border border-uber-border text-white text-xs placeholder:text-zinc-600 focus:border-peach focus:outline-none transition-colors"
                  />
                  <Mail className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                  Password / Counter PIN
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password or 4-digit PIN"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-10 rounded-xl bg-black border border-uber-border text-white text-xs placeholder:text-zinc-600 focus:border-peach focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-peach hover:bg-peach-300 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-peach/20 active:scale-[0.98] transition-all min-h-[46px] mt-2"
              >
                <span>{isSubmitting ? 'Verifying...' : 'Continue to NightBite'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[11px] text-zinc-500 text-center pt-2">
                Staff note: Entering the Admin credentials opens the Counter / Staff Face automatically.
              </div>
            </form>
          ) : (
            /* TAB 2: SIGN UP */
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
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
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-uber-border text-white text-xs placeholder:text-zinc-600 focus:border-peach focus:outline-none"
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
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-uber-border text-white text-xs placeholder:text-zinc-600 focus:border-peach focus:outline-none"
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
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-uber-border text-white text-xs placeholder:text-zinc-600 focus:border-peach focus:outline-none"
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
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-uber-border text-white text-xs placeholder:text-zinc-600 focus:border-peach focus:outline-none"
                />
                <div className="text-[10px] text-zinc-500 mt-1">
                  Must be your official university email (@{allowedDomain})
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Hostel Block &amp; Room No.
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. MH-2 304 or LH-1 210"
                    value={hostelRoom}
                    onChange={(e) => setHostelRoom(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-uber-border text-white text-xs placeholder:text-zinc-600 focus:border-peach focus:outline-none"
                  />
                  <Home className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Create Password <span className="text-peach">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full px-3 py-2.5 pr-9 rounded-xl bg-black border border-uber-border text-white text-xs placeholder:text-zinc-600 focus:border-peach focus:outline-none"
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
                className="w-full py-3.5 px-4 rounded-xl bg-peach hover:bg-peach-300 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-peach/20 active:scale-[0.98] transition-all min-h-[46px] mt-3"
              >
                <span>{isSubmitting ? 'Creating Profile...' : 'Complete Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick 1-Tap Demo Switcher (For Evaluation & Instant Testing) */}
          <div className="mt-6 pt-5 border-t border-uber-border">
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-2.5">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-peach" />
                <span>1-Tap Test Access (VIT-AP Mode):</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => quickDemoLogin('student')}
                className="p-2.5 rounded-xl bg-black hover:bg-zinc-900 border border-uber-border text-left transition-colors group"
              >
                <div className="text-xs font-semibold text-white flex items-center gap-1 group-hover:text-peach">
                  <User className="w-3 h-3 text-peach" />
                  <span>Student Face</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  Kavya S. (MH-1 304)
                </div>
              </button>

              <button
                onClick={() => quickDemoLogin('admin')}
                className="p-2.5 rounded-xl bg-black hover:bg-zinc-900 border border-uber-border text-left transition-colors group"
              >
                <div className="text-xs font-semibold text-white flex items-center gap-1 group-hover:text-peach">
                  <Shield className="w-3 h-3 text-peach" />
                  <span>Staff / Admin Face</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  Counter Dashboard
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

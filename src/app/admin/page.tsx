'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthScreen } from '@/components/AuthScreen';
import { AdminQueue } from '@/components/AdminQueue';
import { Shield, ArrowRight } from 'lucide-react';

export default function AdminPage() {
  const { user, role, quickDemoLogin } = useAuth();

  // If not logged in, show AuthScreen directly
  if (!user) {
    return <AuthScreen />;
  }

  // If logged in as Admin, show AdminQueue
  if (role === 'ADMIN') {
    return (
      <div className="w-full">
        <AdminQueue />
      </div>
    );
  }

  // If logged in as student, give one-tap switch to Admin
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="p-8 bg-uber-surface border border-uber-border rounded-3xl shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-peach-glow border border-peach-border flex items-center justify-center text-peach mx-auto mb-4">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Staff Portal Access</h2>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          You are currently logged in as a student (<span className="text-white">{user.name}</span>). The Counter Face is reserved for mess staff.
        </p>

        <button
          onClick={() => quickDemoLogin('admin')}
          className="w-full py-3 px-4 rounded-xl bg-peach hover:bg-peach-300 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <span>Switch to Staff Counter Face</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthScreen } from '@/components/AuthScreen';
import { ActiveOrderTracker } from '@/components/ActiveOrderTracker';
import { MenuGrid } from '@/components/MenuGrid';
import { AdminQueue } from '@/components/AdminQueue';
import { UtensilsCrossed, Shield } from 'lucide-react';

export default function HomePage() {
  const { user, role } = useAuth();
  const [viewMode, setViewMode] = useState<'AUTO' | 'STUDENT' | 'ADMIN'>('AUTO');

  // If user is not logged in, show the Login/Signup screen first
  if (!user) {
    return <AuthScreen />;
  }

  // Determine effective view
  const effectiveView = viewMode === 'AUTO' ? (role === 'ADMIN' ? 'ADMIN' : 'STUDENT') : viewMode;

  return (
    <div className="w-full">
      {/* Uber Face Switcher Bar — Sleek & Minimal */}
      <div className="px-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-uber-surface border border-uber-border rounded-xl">
          <button
            onClick={() => setViewMode('STUDENT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              effectiveView === 'STUDENT'
                ? 'bg-peach text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Customer Face</span>
          </button>

          <button
            onClick={() => setViewMode('ADMIN')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              effectiveView === 'ADMIN'
                ? 'bg-peach text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Staff / Admin Face</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
          {effectiveView === 'ADMIN' ? 'MH-4 Counter Mode' : 'MH-4 Student View'}
        </span>
      </div>

      {effectiveView === 'ADMIN' ? (
        <AdminQueue />
      ) : (
        <>
          <ActiveOrderTracker />
          <MenuGrid />
        </>
      )}
    </div>
  );
}

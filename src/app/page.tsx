'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNightBite } from '@/context/NightBiteContext';
import { ActiveOrderTracker } from '@/components/ActiveOrderTracker';
import { MenuGrid } from '@/components/MenuGrid';
import { AdminQueue } from '@/components/AdminQueue';
import { UtensilsCrossed, Shield, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { role } = useAuth();
  const [viewMode, setViewMode] = useState<'AUTO' | 'STUDENT' | 'ADMIN'>('AUTO');

  // Determine effective view
  const effectiveView = viewMode === 'AUTO' ? (role === 'ADMIN' ? 'ADMIN' : 'STUDENT') : viewMode;

  return (
    <div className="w-full">
      {/* Dev & Evaluation Fast View Switcher */}
      <div className="px-4 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-night-card border border-night-border rounded-xl">
          <button
            onClick={() => setViewMode('STUDENT')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              effectiveView === 'STUDENT'
                ? 'bg-amber-electric text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Student Menu</span>
          </button>

          <button
            onClick={() => setViewMode('ADMIN')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              effectiveView === 'ADMIN'
                ? 'bg-amber-electric text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Counter</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
          {effectiveView === 'ADMIN' ? 'Live Admin Tablet Mode' : 'Late-Night Student Mobile View'}
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

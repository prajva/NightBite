'use client';

import React from 'react';
import { useNightBite } from '@/context/NightBiteContext';
import { Sparkles, X } from 'lucide-react';

export function StockFreedToast() {
  const { stockFreedToast, dismissStockFreedToast } = useNightBite();

  if (!stockFreedToast) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto animate-slide-up">
      <div className="p-3.5 rounded-xl bg-emerald-stock/20 border border-emerald-stock/60 text-white backdrop-blur-md shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-stock/30 text-emerald-stock">
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-stock uppercase tracking-wider">
              Stock Just Freed Up!
            </div>
            <div className="text-xs text-zinc-200 mt-0.5">{stockFreedToast}</div>
          </div>
        </div>
        <button
          onClick={dismissStockFreedToast}
          className="text-zinc-400 hover:text-white p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

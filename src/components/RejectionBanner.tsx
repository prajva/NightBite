'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { AlertTriangle, X } from 'lucide-react';

export function RejectionBanner() {
  const { rejectionError, clearRejectionError } = useAuth();

  if (!rejectionError) return null;

  return (
    <div className="bg-crimson-dim/60 border border-crimson-danger/50 rounded-xl p-4 mb-4 mx-4 text-white shadow-lg backdrop-blur-md animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-crimson-danger/20 rounded-lg shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-crimson-danger" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-crimson-danger uppercase tracking-wider">
            Domain Verification Failed
          </h4>
          <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
            {rejectionError}
          </p>
          <div className="mt-2 text-[11px] text-zinc-400">
            Tip: Use your registered university roll number email (e.g., <code className="text-amber-electric">student.21bce@vitapstudent.ac.in</code>) or switch via the Demo Role Switcher above.
          </div>
        </div>
        <button
          onClick={clearRejectionError}
          className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

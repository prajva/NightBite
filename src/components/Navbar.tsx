'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useNightBite } from '@/context/NightBiteContext';
import {
  Clock,
  Shield,
  User,
  LogOut,
  Sparkles,
  ChevronDown,
  Layers,
  UtensilsCrossed,
  Sliders,
  Check,
} from 'lucide-react';

export function Navbar() {
  const { user, role, logout, quickDemoLogin } = useAuth();
  const { messStatus, toggleMessHoursOverride } = useNightBite();
  const [hoursModalOpen, setHoursModalOpen] = useState(false);

  if (!user) return null; // Don't show header on the login/signup screen

  return (
    <>
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-uber-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo — Minimalist Uber Peach */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-peach-glow border border-peach-border flex items-center justify-center relative overflow-hidden">
              <span className="font-extrabold text-sm text-peach font-mono">NB</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-peach transition-colors">
                  Night<span className="text-peach">Bite</span>
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-peach/15 text-peach border border-peach/30">
                  {role === 'ADMIN' ? 'Staff' : 'Hostel'}
                </span>
              </div>
            </div>
          </Link>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            {/* Live Mess Status Pill */}
            <button
              onClick={() => setHoursModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all border ${
                messStatus.isOpen
                  ? 'bg-stock-green/10 text-stock-green border-stock-green/30 hover:bg-stock-green/20'
                  : 'bg-peach-glow text-peach border-peach-border hover:bg-peach/20'
              }`}
              title="Click to view mess operating hours & test override"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  messStatus.isOpen ? 'bg-stock-green animate-pulse' : 'bg-peach'
                }`}
              />
              <span className="hidden sm:inline">
                {messStatus.isOpen ? 'OPEN' : 'OPENS AT 10:30 PM'}
              </span>
              <span className="tabular-nums">
                {messStatus.isOpen
                  ? `Closes in ${messStatus.timeRemainingFormatted}`
                  : messStatus.timeRemainingFormatted}
              </span>
            </button>

            {/* User Pill & Sign Out */}
            <div className="flex items-center gap-1 bg-uber-surface border border-uber-border rounded-xl p-1">
              <div className="px-2.5 py-1 text-xs text-zinc-300 flex items-center gap-1.5">
                {role === 'ADMIN' ? (
                  <Shield className="w-3.5 h-3.5 text-peach" />
                ) : (
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                )}
                <span className="font-medium max-w-[100px] truncate hidden sm:inline">
                  {user.name}
                </span>
                {user.hostelRoom && (
                  <span className="text-[10px] text-peach font-mono hidden md:inline">
                    ({user.hostelRoom})
                  </span>
                )}
              </div>

              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Operating Hours Modal */}
      {hoursModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-uber-surface border border-uber-border rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-peach-glow border border-peach-border text-peach">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">VIT-AP Mess Schedule</h3>
                <p className="text-xs text-zinc-400">Strict Late-Night Hostel Policy</p>
              </div>
            </div>

            <div className="space-y-2.5 bg-black rounded-2xl p-4 border border-uber-border text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Daily Operating Window:</span>
                <span className="font-mono font-semibold text-peach">10:30 PM – 12:00 AM IST</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Current Time (IST):</span>
                <span className="font-mono text-white tabular-nums">{messStatus.istTimeString}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Status:</span>
                <span
                  className={`font-semibold font-mono px-2 py-0.5 rounded text-[10px] ${
                    messStatus.isOpen
                      ? 'bg-stock-green/20 text-stock-green'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {messStatus.isOpen ? 'ACTIVE / ACCEPTING ORDERS' : 'CLOSED'}
                </span>
              </div>
            </div>

            {/* Demo Hours Override for Testing */}
            <div className="mt-4 p-3 rounded-2xl bg-black border border-uber-border flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-peach" />
                  <span>Testing Override</span>
                </div>
                <div className="text-[10px] text-zinc-400">Force open mess 24/7 for testing</div>
              </div>
              <button
                onClick={toggleMessHoursOverride}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-colors ${
                  messStatus.isOverrideActive
                    ? 'bg-peach text-black font-bold'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {messStatus.isOverrideActive ? 'OVERRIDE ON' : 'STRICT IST'}
              </button>
            </div>

            <button
              onClick={() => setHoursModalOpen(false)}
              className="w-full mt-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

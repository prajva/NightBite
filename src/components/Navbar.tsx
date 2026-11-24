'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useNightBite } from '@/context/NightBiteContext';
import {
  Moon,
  Clock,
  Shield,
  User,
  Sparkles,
  ChevronDown,
  Layers,
  UtensilsCrossed,
  Sliders,
  Check,
} from 'lucide-react';

export function Navbar() {
  const { user, role, switchDemoUser, allowedDomain, setIsAdminLoginModalOpen } = useAuth();
  const { messStatus, toggleMessHoursOverride } = useNightBite();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [hoursModalOpen, setHoursModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-night-black/90 backdrop-blur-md border-b border-night-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-night-card border border-night-border flex items-center justify-center relative overflow-hidden group-hover:border-amber-electric/50 transition-colors">
              <Moon className="w-5 h-5 text-amber-electric fill-amber-electric/20" />
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-electric animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-amber-electric transition-colors">
                  NightBite
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-amber-electric/15 text-amber-electric border border-amber-electric/30">
                  Hostel Mess
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono">10:30 PM – 12:00 AM IST</p>
            </div>
          </Link>

          {/* Right Actions: Status Pill & Role Switcher */}
          <div className="flex items-center gap-2">
            {/* Live Mess Status Pill */}
            <button
              onClick={() => setHoursModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all border ${
                messStatus.isOpen
                  ? 'bg-emerald-stock/10 text-emerald-stock border-emerald-stock/30 hover:bg-emerald-stock/20'
                  : 'bg-amber-electric/10 text-amber-electric border-amber-electric/30 hover:bg-amber-electric/20'
              }`}
              title="Click to view operating hours & demo simulation override"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  messStatus.isOpen ? 'bg-emerald-stock animate-pulse' : 'bg-amber-electric'
                }`}
              />
              <span className="hidden sm:inline">
                {messStatus.isOpen ? 'OPEN' : 'OPENS AT 10:30 PM'}
              </span>
              <span className="tabular-nums">
                {messStatus.isOpen ? `Closes ${messStatus.timeRemainingFormatted}` : messStatus.timeRemainingFormatted}
              </span>
            </button>

            {/* Demo Role Switcher Button */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 bg-night-card hover:bg-night-elevated border border-night-border hover:border-zinc-700 px-2.5 py-1.5 rounded-lg text-xs text-zinc-200 transition-colors"
                aria-label="Role Switcher"
              >
                {role === 'ADMIN' ? (
                  <Shield className="w-3.5 h-3.5 text-amber-electric" />
                ) : (
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                )}
                <span className="max-w-[90px] sm:max-w-[130px] truncate font-medium">
                  {role === 'ADMIN' ? 'Admin Counter' : user?.name || 'Student'}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {/* Role Dropdown */}
              {roleMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-night-card border border-night-border rounded-xl shadow-2xl p-2 z-50 animate-fade-in"
                  onClick={() => setRoleMenuOpen(false)}
                >
                  <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-night-border/80 mb-1 flex items-center justify-between">
                    <span>Role Switcher (Dev Mode)</span>
                    <Sliders className="w-3 h-3 text-amber-electric" />
                  </div>

                  {/* Student 1 */}
                  <button
                    onClick={() => switchDemoUser('student')}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                      user?.email === 'kavya.21bce@vitapstudent.ac.in'
                        ? 'bg-amber-electric/15 text-amber-electric font-semibold'
                        : 'text-zinc-300 hover:bg-night-elevated'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5" />
                        <span>Kavya S. (Student)</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        kavya.21bce@{allowedDomain}
                      </div>
                    </div>
                    {user?.email === 'kavya.21bce@vitapstudent.ac.in' && (
                      <Check className="w-4 h-4 text-amber-electric" />
                    )}
                  </button>

                  {/* Student 2 / Roommate */}
                  <button
                    onClick={() => switchDemoUser('roommate')}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                      user?.email === 'rahul.21bce@vitapstudent.ac.in'
                        ? 'bg-amber-electric/15 text-amber-electric font-semibold'
                        : 'text-zinc-300 hover:bg-night-elevated'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5" />
                        <span>Rahul V. (Roommate)</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        rahul.21bce@{allowedDomain}
                      </div>
                    </div>
                    {user?.email === 'rahul.21bce@vitapstudent.ac.in' && (
                      <Check className="w-4 h-4 text-amber-electric" />
                    )}
                  </button>

                  {/* Admin Counter */}
                  <button
                    onClick={() => switchDemoUser('admin')}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                      role === 'ADMIN'
                        ? 'bg-amber-electric/15 text-amber-electric font-semibold'
                        : 'text-zinc-300 hover:bg-night-elevated'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Shield className="w-3.5 h-3.5 text-amber-electric" />
                        <span>Mess Counter Admin</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        messadmin@vitap.ac.in
                      </div>
                    </div>
                    {role === 'ADMIN' && <Check className="w-4 h-4 text-amber-electric" />}
                  </button>

                  {/* Admin Password Login Modal Trigger */}
                  <div className="border-t border-night-border/80 my-1 pt-1">
                    <button
                      onClick={() => setIsAdminLoginModalOpen(true)}
                      className="w-full text-left p-2 rounded-lg text-xs text-amber-electric hover:bg-amber-electric/10 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Admin Login (Password / PIN)</span>
                      </div>
                      <span className="text-[10px] bg-amber-electric/20 text-amber-electric px-1.5 py-0.5 rounded font-mono">
                        Secure
                      </span>
                    </button>
                  </div>

                  {/* Test Gmail Rejection */}
                  <div className="border-t border-night-border/80 my-1 pt-1">
                    <button
                      onClick={() => switchDemoUser('gmail')}
                      className="w-full text-left p-2 rounded-lg text-xs text-crimson-danger hover:bg-crimson-danger/10 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 font-medium">
                        <span>Simulate Personal Gmail Login</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        john.doe@gmail.com (Triggers Reject Banner)
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Operating Hours & Override Modal */}
      {hoursModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-night-card border border-night-border rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-electric/15 border border-amber-electric/30 text-amber-electric">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Mess Operating Schedule</h3>
                <p className="text-xs text-zinc-400">Strict Late-Night Hostel Policy</p>
              </div>
            </div>

            <div className="space-y-3 bg-night-black/60 rounded-xl p-4 border border-night-border/80 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Daily Window:</span>
                <span className="font-mono font-semibold text-white">10:30 PM – 12:00 AM IST</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Current IST Time:</span>
                <span className="font-mono text-amber-electric tabular-nums">{messStatus.istTimeString}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Current Status:</span>
                <span
                  className={`font-semibold font-mono px-2 py-0.5 rounded text-[11px] ${
                    messStatus.isOpen
                      ? 'bg-emerald-stock/20 text-emerald-stock border border-emerald-stock/30'
                      : 'bg-crimson-danger/20 text-crimson-danger border border-crimson-danger/30'
                  }`}
                >
                  {messStatus.isOpen ? 'ACTIVE / ACCEPTING ORDERS' : 'CLOSED'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-400">Countdown:</span>
                <span className="font-mono text-zinc-200 tabular-nums">
                  {messStatus.isOpen ? `Closes in ${messStatus.timeRemainingFormatted}` : `Opens in ${messStatus.timeRemainingFormatted}`}
                </span>
              </div>
            </div>

            {/* Evaluation Override Toggle */}
            <div className="mt-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-electric" />
                  <span>Demo Hours Override</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Force open mess 24/7 for evaluation & testing
                </div>
              </div>
              <button
                onClick={toggleMessHoursOverride}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors ${
                  messStatus.isOverrideActive
                    ? 'bg-amber-electric text-black'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {messStatus.isOverrideActive ? 'OVERRIDE ON' : 'STRICT IST'}
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setHoursModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-night-elevated hover:bg-zinc-700 text-white font-medium text-xs border border-zinc-700 transition-colors"
              >
                Close Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

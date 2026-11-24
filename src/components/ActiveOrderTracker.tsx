'use client';

import React, { useState, useEffect } from 'react';
import { useNightBite } from '@/context/NightBiteContext';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  QrCode,
  PackageCheck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'PENDING_APPROVAL', label: 'Requested' },
  { key: 'AWAITING_PAYMENT', label: 'Payment' },
  { key: 'PREPARING', label: 'Cooking' },
  { key: 'READY_FOR_PICKUP', label: 'Ready' },
];

export function ActiveOrderTracker() {
  const { activeOrder, setUpiModalOpen } = useNightBite();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!activeOrder || activeOrder.status !== 'AWAITING_PAYMENT' || !activeOrder.paymentDeadline) {
      setSecondsLeft(null);
      return;
    }

    const updateTimer = () => {
      const remainingMs = activeOrder.paymentDeadline! - Date.now();
      const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
      setSecondsLeft(remainingSec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeOrder?.status, activeOrder?.paymentDeadline]);

  if (!activeOrder) return null;

  // Step index calculation
  const getStepIndex = () => {
    switch (activeOrder.status) {
      case 'PENDING_APPROVAL':
        return 0;
      case 'AWAITING_PAYMENT':
      case 'PAYMENT_VERIFYING':
        return 1;
      case 'PREPARING':
        return 2;
      case 'READY_FOR_PICKUP':
      case 'COMPLETED':
        return 3;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex();
  const isDeclined = activeOrder.status === 'DECLINED';
  const isReady = activeOrder.status === 'READY_FOR_PICKUP';
  const isExpired = activeOrder.status === 'EXPIRED';

  // Format seconds to MM:SS
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="mb-6 mx-4 animate-slide-up">
      <div
        className={`rounded-2xl p-4 sm:p-5 border transition-all shadow-xl backdrop-blur-md ${
          isReady
            ? 'bg-emerald-stock/15 border-emerald-stock/60 shadow-emerald-950/40'
            : isDeclined
            ? 'bg-crimson-dim/60 border-crimson-danger/60 shadow-red-950/40'
            : 'bg-night-card border-night-border'
        }`}
      >
        {/* Top Header: Token # & Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Active Order
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-electric font-mono tracking-tight">
                #{activeOrder.tokenNumber}
              </span>
              <span className="text-xs text-zinc-400">
                • {activeOrder.items.reduce((s, it) => s + it.quantity, 0)} items (₹{activeOrder.totalAmount})
              </span>
            </div>
            {activeOrder.roommateTag && (
              <div className="text-[11px] text-zinc-300 mt-1 flex items-center gap-1">
                <span className="text-amber-electric">Tag:</span> &ldquo;{activeOrder.roommateTag}&rdquo;
              </div>
            )}
          </div>

          {/* Pickup PIN Pill */}
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Pickup PIN
            </div>
            <div className="mt-0.5 px-3 py-1 bg-night-black border border-night-border rounded-lg inline-flex items-center gap-1.5 font-mono text-base font-bold text-white tracking-widest shadow-inner">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-electric" />
              <span>{activeOrder.pickupPin}</span>
            </div>
          </div>
        </div>

        {/* Step Progress Bar (Hidden if Declined/Expired) */}
        {!isDeclined && !isExpired && (
          <div className="mb-4 pt-1">
            <div className="flex items-center justify-between relative">
              {/* Background Connecting Line */}
              <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-0.5 bg-zinc-800 -z-0" />
              {/* Active Connecting Line */}
              <div
                className="absolute left-3 top-1/2 -translate-y-1/2 h-0.5 bg-amber-electric transition-all duration-500 -z-0"
                style={{
                  width: `${(currentStep / (STATUS_STEPS.length - 1)) * 94}%`,
                }}
              />

              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx < currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-amber-electric text-black shadow-md shadow-amber-500/20'
                          : isCurrent
                          ? 'bg-amber-electric text-black ring-4 ring-amber-electric/25 animate-pulse'
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] mt-1.5 font-medium transition-colors ${
                        isCurrent
                          ? 'text-amber-electric font-semibold'
                          : isPassed
                          ? 'text-zinc-200'
                          : 'text-zinc-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Context Banners based on Order State */}
        {activeOrder.status === 'PENDING_APPROVAL' && (
          <div className="p-3 rounded-xl bg-night-black/70 border border-night-border/80 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-electric animate-ping shrink-0" />
            <div className="text-xs text-zinc-300">
              <span className="font-semibold text-white">Stock Soft-Locked.</span> Mess counter admin is reviewing your order. Please wait a few seconds...
            </div>
          </div>
        )}

        {activeOrder.status === 'AWAITING_PAYMENT' && (
          <div className="p-3.5 rounded-xl bg-amber-electric/15 border border-amber-electric/40 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-electric animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-electric">
                  Order Accepted • Pay via UPI
                </span>
              </div>
              {secondsLeft !== null && (
                <div
                  className={`text-sm font-mono font-extrabold px-2.5 py-0.5 rounded-md ${
                    secondsLeft <= 45
                      ? 'bg-crimson-danger text-white animate-pulse'
                      : 'bg-black text-amber-electric border border-amber-electric/30'
                  }`}
                >
                  {formatTimer(secondsLeft)}
                </div>
              )}
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-3">
              Admin accepted your request. Complete UPI payment within the countdown timer to keep your items locked.
            </p>

            <button
              onClick={() => setUpiModalOpen(true)}
              className="w-full py-2.5 bg-amber-electric hover:bg-amber-glow text-black font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-transform min-h-[44px]"
            >
              <QrCode className="w-4 h-4" />
              <span>Open UPI QR & Submit 12-Digit UTR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeOrder.status === 'PAYMENT_VERIFYING' && (
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-xs text-zinc-200 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-electric/10 text-amber-electric">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="font-semibold text-white">UTR #{activeOrder.utrNumber} Submitted!</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Admin is verifying your transaction. Kitchen prep starts as soon as confirmed.
              </div>
            </div>
          </div>
        )}

        {activeOrder.status === 'PREPARING' && (
          <div className="p-3.5 rounded-xl bg-amber-electric/10 border border-amber-electric/30 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-electric/20 text-amber-electric">
              <Flame className="w-5 h-5 animate-bounce" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-white text-sm">Now Cooking in Mess Kitchen!</div>
              <div className="text-zinc-300 mt-0.5">
                Your order is on the tawa. Keep your phone nearby—you will receive an audio chime when ready.
              </div>
            </div>
          </div>
        )}

        {activeOrder.status === 'READY_FOR_PICKUP' && (
          <div className="p-4 rounded-xl bg-emerald-stock/20 border border-emerald-stock/50 text-white animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <PackageCheck className="w-6 h-6 text-emerald-stock" />
              <span className="text-sm font-extrabold uppercase tracking-wider text-emerald-stock">
                FOOD READY AT COUNTER!
              </span>
            </div>
            <p className="text-xs text-zinc-200 mb-3">
              Head to the night mess counter now. Show your 4-digit Pickup PIN to collect your hot meal:
            </p>
            <div className="p-2.5 bg-black/70 rounded-xl border border-emerald-stock/40 text-center font-mono text-xl font-black text-emerald-stock tracking-widest">
              PIN: {activeOrder.pickupPin}
            </div>
          </div>
        )}

        {isDeclined && (
          <div className="p-3.5 rounded-xl bg-crimson-danger/20 border border-crimson-danger/40 text-white">
            <div className="flex items-center gap-2 mb-1 text-crimson-danger font-bold text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>Order Declined by Counter</span>
            </div>
            <p className="text-xs text-zinc-200 mt-1">
              Reason: <span className="font-semibold text-white">&ldquo;{activeOrder.declineReason || 'Kitchen unavailable'}&rdquo;</span>
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              Your items have been immediately released back to available stock. You may update your items and try again.
            </p>
          </div>
        )}

        {isExpired && (
          <div className="p-3.5 rounded-xl bg-crimson-danger/20 border border-crimson-danger/40 text-white">
            <div className="flex items-center gap-2 mb-1 text-crimson-danger font-bold text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>Payment Window Expired</span>
            </div>
            <p className="text-xs text-zinc-300 mt-1">
              Payment was not submitted within the 3-minute window. Reserved stock has been automatically returned to the live menu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

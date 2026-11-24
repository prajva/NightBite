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

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="mb-6 mx-4 animate-slide-up">
      <div
        className={`rounded-2xl p-4 sm:p-5 border transition-all shadow-xl ${
          isReady
            ? 'bg-stock-green/10 border-stock-green/50'
            : isDeclined || isExpired
            ? 'bg-red-950/30 border-red-500/40'
            : 'bg-uber-surface border-uber-border'
        }`}
      >
        {/* Header: Token # & PIN */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Active Order
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-peach font-mono tracking-tight">
                #{activeOrder.tokenNumber}
              </span>
              <span className="text-xs text-zinc-400">
                • {activeOrder.items.reduce((s, it) => s + it.quantity, 0)} items (₹{activeOrder.totalAmount})
              </span>
            </div>
            {activeOrder.roommateTag && (
              <div className="text-[11px] text-zinc-300 mt-1">
                <span className="text-peach">Room Note:</span> &ldquo;{activeOrder.roommateTag}&rdquo;
              </div>
            )}
          </div>

          {/* Pickup PIN Pill */}
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Pickup PIN
            </div>
            <div className="mt-0.5 px-3 py-1 bg-black border border-peach-border rounded-xl inline-flex items-center gap-1.5 font-mono text-base font-bold text-white tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-peach" />
              <span>{activeOrder.pickupPin}</span>
            </div>
          </div>
        </div>

        {/* Uber Step Progress Bar */}
        {!isDeclined && !isExpired && (
          <div className="mb-4 pt-1">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-0.5 bg-zinc-800 -z-0" />
              <div
                className="absolute left-3 top-1/2 -translate-y-1/2 h-0.5 bg-peach transition-all duration-500 -z-0"
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
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                        isPassed
                          ? 'bg-peach text-black shadow-sm'
                          : isCurrent
                          ? 'bg-peach text-black ring-4 ring-peach/20 animate-pulse'
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] mt-1.5 font-medium ${
                        isCurrent ? 'text-peach font-semibold' : isPassed ? 'text-zinc-200' : 'text-zinc-500'
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

        {/* Status Actions */}
        {activeOrder.status === 'PENDING_APPROVAL' && (
          <div className="p-3 rounded-xl bg-black border border-uber-border flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-peach animate-ping shrink-0" />
            <div className="text-xs text-zinc-300">
              <strong className="text-white">Stock Soft-Locked.</strong> Counter admin is reviewing your order. Please wait...
            </div>
          </div>
        )}

        {activeOrder.status === 'AWAITING_PAYMENT' && (
          <div className="p-3.5 rounded-xl bg-peach-glow border border-peach-border text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-peach">
                Order Accepted • Pay via UPI
              </span>
              {secondsLeft !== null && (
                <div
                  className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                    secondsLeft <= 45
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-black text-peach border border-peach-border'
                  }`}
                >
                  {formatTimer(secondsLeft)}
                </div>
              )}
            </div>

            <p className="text-xs text-zinc-300 mb-3">
              Submit your 12-digit UPI UTR before the countdown reaches 00:00 to keep your portions reserved.
            </p>

            <button
              onClick={() => setUpiModalOpen(true)}
              className="w-full py-2.5 bg-peach hover:bg-peach-300 text-black font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all min-h-[42px]"
            >
              <QrCode className="w-4 h-4" />
              <span>Open UPI QR &amp; Enter 12-Digit UTR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeOrder.status === 'PAYMENT_VERIFYING' && (
          <div className="p-3 rounded-xl bg-black border border-uber-border text-xs text-zinc-300 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-peach shrink-0 animate-pulse" />
            <div>
              <div className="font-semibold text-white">UTR #{activeOrder.utrNumber} Submitted!</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Staff is verifying your payment receipt at the counter. Kitchen prep begins immediately.
              </div>
            </div>
          </div>
        )}

        {activeOrder.status === 'PREPARING' && (
          <div className="p-3 rounded-xl bg-peach-glow border border-peach-border text-xs text-zinc-200 flex items-center gap-3">
            <Flame className="w-5 h-5 text-peach shrink-0 animate-bounce" />
            <div>
              <div className="font-bold text-white">Now Cooking in Mess Kitchen!</div>
              <div className="text-[11px] text-zinc-300 mt-0.5">
                Your order is on the tawa. You will receive an alert chime when ready for pickup.
              </div>
            </div>
          </div>
        )}

        {activeOrder.status === 'READY_FOR_PICKUP' && (
          <div className="p-4 rounded-xl bg-stock-green/15 border border-stock-green/40 text-white animate-pulse">
            <div className="flex items-center gap-2 mb-1.5">
              <PackageCheck className="w-5 h-5 text-stock-green" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-stock-green">
                Food Ready at Counter!
              </span>
            </div>
            <p className="text-xs text-zinc-300 mb-2.5">
              Head to the hostel night mess counter and show your 4-digit Pickup PIN:
            </p>
            <div className="p-2 bg-black rounded-xl border border-stock-green/30 text-center font-mono text-xl font-black text-stock-green tracking-widest">
              PIN: {activeOrder.pickupPin}
            </div>
          </div>
        )}

        {isDeclined && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200">
            <div className="font-bold uppercase tracking-wider text-red-400 mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Order Declined</span>
            </div>
            <div>Reason: &ldquo;{activeOrder.declineReason || 'Kitchen unavailable'}&rdquo;</div>
            <div className="text-[10px] text-zinc-400 mt-1">
              Your items have been returned to available stock. You may update your cart and order again.
            </div>
          </div>
        )}

        {isExpired && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200">
            <div className="font-bold uppercase tracking-wider text-red-400 mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Payment Window Expired</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">
              Payment was not submitted within the 3-minute window. Reserved stock has been automatically released back to the live menu.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

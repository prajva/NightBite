'use client';

import React, { useState, useEffect } from 'react';
import { useNightBite } from '@/context/NightBiteContext';
import {
  X,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export function UpiPaymentSheet() {
  const { upiModalOpen, setUpiModalOpen, activeOrder, submitUtr } = useNightBite();
  const [utrInput, setUtrInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const UPI_ID = 'nightbite.mess@upi';

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

  if (!upiModalOpen || !activeOrder) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrInput.trim();
    if (!cleanUtr) {
      setErrorMsg('Please enter your 12-digit UPI Transaction / UTR ID.');
      return;
    }
    if (cleanUtr.length !== 12 || !/^\d{12}$/.test(cleanUtr)) {
      setErrorMsg('UTR must be exactly 12 digits (e.g., 432109876543).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await submitUtr(activeOrder.id, cleanUtr);
      setUtrInput('');
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Failed to submit UTR. Please check details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-night-card border border-night-border rounded-t-3xl sm:rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-night-border mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-electric/15 rounded-xl text-amber-electric">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">UPI Payment Sheet</h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Order #{activeOrder.tokenNumber} • ₹{activeOrder.totalAmount}
              </p>
            </div>
          </div>
          <button
            onClick={() => setUpiModalOpen(false)}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Countdown Timer Badge */}
        {secondsLeft !== null && (
          <div
            className={`flex items-center justify-between p-3 rounded-xl mb-4 font-mono text-xs border ${
              secondsLeft <= 45
                ? 'bg-crimson-danger/20 border-crimson-danger/40 text-crimson-danger animate-pulse'
                : 'bg-amber-electric/10 border-amber-electric/30 text-amber-electric'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Time Remaining to Pay:</span>
            </div>
            <span className="font-black text-sm tabular-nums">{formatTimer(secondsLeft)}</span>
          </div>
        )}

        {/* High-Contrast QR Code Card */}
        <div className="bg-night-black p-5 rounded-2xl border border-zinc-800 text-center mb-4 flex flex-col items-center">
          <div className="w-48 h-48 bg-white p-3 rounded-xl flex items-center justify-center relative shadow-lg">
            {/* High fidelity SVG Mock QR Code */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-black fill-current">
              {/* Corner position markers */}
              <rect x="5" y="5" width="26" height="26" fill="black" />
              <rect x="9" y="9" width="18" height="18" fill="white" />
              <rect x="13" y="13" width="10" height="10" fill="black" />

              <rect x="69" y="5" width="26" height="26" fill="black" />
              <rect x="73" y="9" width="18" height="18" fill="white" />
              <rect x="77" y="13" width="10" height="10" fill="black" />

              <rect x="5" y="69" width="26" height="26" fill="black" />
              <rect x="9" y="73" width="18" height="18" fill="white" />
              <rect x="13" y="77" width="10" height="10" fill="black" />

              {/* Data blocks */}
              <rect x="36" y="8" width="5" height="5" />
              <rect x="44" y="14" width="6" height="5" />
              <rect x="54" y="8" width="8" height="6" />
              <rect x="36" y="24" width="8" height="7" />
              <rect x="50" y="24" width="6" height="6" />

              <rect x="8" y="38" width="7" height="6" />
              <rect x="20" y="44" width="6" height="6" />
              <rect x="32" y="38" width="6" height="6" />
              <rect x="42" y="44" width="14" height="6" />
              <rect x="62" y="38" width="10" height="6" />
              <rect x="78" y="44" width="8" height="6" />

              <rect x="38" y="62" width="6" height="8" />
              <rect x="50" y="66" width="8" height="6" />
              <rect x="66" y="62" width="6" height="12" />
              <rect x="78" y="66" width="14" height="8" />
              <rect x="42" y="78" width="8" height="10" />
              <rect x="56" y="84" width="12" height="6" />
              <rect x="74" y="82" width="10" height="8" />

              {/* Center Logo Icon */}
              <circle cx="50" cy="50" r="10" fill="white" />
              <circle cx="50" cy="50" r="7" fill="#F59E0B" />
            </svg>
          </div>

          <div className="mt-3">
            <div className="text-xl font-extrabold text-white font-mono">
              ₹{activeOrder.totalAmount}.00
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Scan with GPay, PhonePe, Paytm, or BHIM
            </div>
          </div>
        </div>

        {/* Copyable UPI ID Box */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-night-black border border-night-border mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">
              Mess UPI ID
            </div>
            <div className="text-xs font-mono font-semibold text-zinc-200 mt-0.5">
              {UPI_ID}
            </div>
          </div>
          <button
            onClick={handleCopyUpi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors border border-zinc-700 font-medium"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-stock" />
                <span className="text-emerald-stock">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* UTR Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Enter 12-Digit UPI Transaction / UTR Number <span className="text-amber-electric">*</span>
            </label>
            <input
              type="text"
              maxLength={12}
              pattern="\d{12}"
              placeholder="e.g. 432189765412"
              value={utrInput}
              onChange={(e) => {
                setUtrInput(e.target.value.replace(/\D/g, ''));
                if (errorMsg) setErrorMsg(null);
              }}
              className="w-full px-4 py-3 rounded-xl bg-night-black border border-night-border focus:border-amber-electric focus:ring-1 focus:ring-amber-electric text-white font-mono tracking-widest text-sm placeholder:text-zinc-600 transition-colors"
            />
            <div className="text-[10px] text-zinc-400 mt-1">
              Find the 12-digit UTR in your payment app&apos;s receipt. Duplicate UTR submissions are detected and blocked.
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-crimson-danger/15 border border-crimson-danger/40 text-xs text-crimson-danger flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || utrInput.length !== 12}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-electric hover:bg-amber-glow disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all min-h-[48px]"
          >
            {isSubmitting ? (
              <span>Verifying UTR...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm &amp; Submit Payment</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

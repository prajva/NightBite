'use client';

import React from 'react';
import { useNightBite } from '@/context/NightBiteContext';
import { AlertCircle, RefreshCw, XCircle } from 'lucide-react';

export function StockConflictModal() {
  const { stockConflict, resolveConflictAndUpdateCart, dismissStockConflict } = useNightBite();

  if (!stockConflict) return null;

  const { itemId, itemName, requestedQty, availableQty } = stockConflict;
  const isSoldOut = availableQty <= 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-uber-surface border border-peach-border rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl relative">
        <div className="w-11 h-11 rounded-2xl bg-peach-glow border border-peach-border flex items-center justify-center mb-3 text-peach mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-center text-white">
          Stock Just Updated!
        </h3>

        <div className="my-3.5 p-3 rounded-2xl bg-black border border-uber-border text-xs leading-relaxed text-zinc-300">
          {isSoldOut ? (
            <>
              Someone locked the remaining portions just a moment ago! <strong className="text-red-400">{itemName}</strong> is now completely <span className="text-red-400 font-bold">SOLD OUT</span> for tonight.
            </>
          ) : (
            <>
              A concurrent student order locked stock milliseconds earlier! Only{' '}
              <strong className="text-peach font-semibold">{availableQty} {itemName}</strong>{' '}
              remain (you requested {requestedQty}).
            </>
          )}
        </div>

        <div className="space-y-2 mt-4">
          {!isSoldOut ? (
            <>
              <button
                onClick={() => resolveConflictAndUpdateCart(itemId, availableQty, true)}
                className="w-full py-3 px-4 rounded-xl bg-peach hover:bg-peach-300 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all min-h-[44px]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Update Cart to {availableQty} &amp; Retry</span>
              </button>

              <button
                onClick={() => resolveConflictAndUpdateCart(itemId, availableQty, false)}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-800 transition-colors"
              >
                Adjust Cart Manually
              </button>
            </>
          ) : (
            <button
              onClick={() => resolveConflictAndUpdateCart(itemId, 0, false)}
              className="w-full py-3 px-4 rounded-xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 min-h-[44px]"
            >
              <XCircle className="w-4 h-4" />
              <span>Remove Sold Out Item from Cart</span>
            </button>
          )}

          <button
            onClick={dismissStockConflict}
            className="w-full py-1.5 text-zinc-500 hover:text-zinc-400 text-xs text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

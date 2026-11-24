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
      <div className="bg-night-card border border-amber-electric/50 rounded-2xl max-w-sm w-full p-6 text-white shadow-2xl relative">
        <div className="w-12 h-12 rounded-2xl bg-amber-electric/15 border border-amber-electric/30 flex items-center justify-center mb-4 text-amber-electric mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-center text-white">
          Stock Just Updated!
        </h3>

        <div className="my-4 p-3.5 rounded-xl bg-night-black border border-night-border text-xs leading-relaxed text-zinc-300">
          {isSoldOut ? (
            <>
              Someone locked the remaining portions just a moment ago! <strong className="text-crimson-danger">{itemName}</strong> is now completely <span className="text-crimson-danger font-bold">SOLD OUT</span> for the night.
            </>
          ) : (
            <>
              A concurrent student order locked stock milliseconds earlier! Only{' '}
              <strong className="text-amber-electric font-semibold">{availableQty} {itemName}</strong>{' '}
              remain in stock (you requested {requestedQty}).
            </>
          )}
        </div>

        <div className="space-y-2 mt-5">
          {!isSoldOut ? (
            <>
              <button
                onClick={() => resolveConflictAndUpdateCart(itemId, availableQty, true)}
                className="w-full py-3 px-4 rounded-xl bg-amber-electric hover:bg-amber-glow text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-transform min-h-[48px]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Update Cart to {availableQty} &amp; Retry Order</span>
              </button>

              <button
                onClick={() => resolveConflictAndUpdateCart(itemId, availableQty, false)}
                className="w-full py-2.5 px-4 rounded-xl bg-night-elevated hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700 transition-colors"
              >
                Adjust Cart Manually
              </button>
            </>
          ) : (
            <button
              onClick={() => resolveConflictAndUpdateCart(itemId, 0, false)}
              className="w-full py-3 px-4 rounded-xl bg-crimson-danger text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 min-h-[48px]"
            >
              <XCircle className="w-4 h-4" />
              <span>Remove Sold Out Item from Cart</span>
            </button>
          )}

          <button
            onClick={dismissStockConflict}
            className="w-full py-2 text-zinc-500 hover:text-zinc-400 text-xs text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

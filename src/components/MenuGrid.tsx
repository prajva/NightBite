'use client';

import React, { useState } from 'react';
import { useNightBite } from '@/context/NightBiteContext';
import { useAuth } from '@/context/AuthContext';
import { MenuItem, DietaryType } from '@/types';
import {
  Plus,
  Minus,
  ShoppingBag,
  Flame,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = ['All', 'Rolls', 'Maggi & Noodles', 'Snacks & Bites', 'Beverages'];

export function MenuGrid() {
  const { user } = useAuth();
  const {
    menuItems,
    cart,
    roommateTag,
    setRoommateTag,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    requestOrder,
    messStatus,
    selectedCategory,
    setSelectedCategory,
  } = useNightBite();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Filter items by category
  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  // Cart summary calculations
  const totalItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleOrderSubmit = async () => {
    if (!messStatus.isOpen) {
      setSubmitError('Night mess is currently closed! Mess operates strictly from 10:30 PM to 12:00 AM IST. Toggle Demo Hours Override in the top pill to test ordering.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await requestOrder();
    } catch (err: unknown) {
      setSubmitError((err as Error).message || 'Failed to submit order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDietaryIcon = (dietary: DietaryType) => {
    switch (dietary) {
      case 'veg':
        return (
          <span className="w-3.5 h-3.5 border border-emerald-stock flex items-center justify-center p-0.5 rounded-sm" title="Pure Veg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-stock" />
          </span>
        );
      case 'non-veg':
        return (
          <span className="w-3.5 h-3.5 border border-crimson-danger flex items-center justify-center p-0.5 rounded-sm" title="Non-Veg">
            <span className="w-1.5 h-1.5 rounded-full bg-crimson-danger" />
          </span>
        );
      case 'egg':
        return (
          <span className="w-3.5 h-3.5 border border-amber-electric flex items-center justify-center p-0.5 rounded-sm" title="Egg">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-electric" />
          </span>
        );
    }
  };

  return (
    <div className="pb-32 px-4 max-w-4xl mx-auto">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 mb-4">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
              selectedCategory === category
                ? 'bg-amber-electric text-black font-semibold border-amber-electric shadow-md shadow-amber-500/20'
                : 'bg-night-card text-zinc-300 border-night-border hover:bg-night-elevated hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredItems.map((item) => {
          const cartItem = cart.find((i) => i.menuItemId === item.id);
          const currentQty = cartItem ? cartItem.quantity : 0;
          const isSoldOut = item.isSoldOut || item.availableStock <= 0;
          const isLowStock = !isSoldOut && item.availableStock <= 5;

          return (
            <div
              key={item.id}
              className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                isSoldOut
                  ? 'bg-night-card/50 border-zinc-800/60 opacity-60'
                  : 'bg-night-card border-night-border hover:border-zinc-700 shadow-lg'
              }`}
            >
              <div>
                {/* Card Top: Dietary & Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {renderDietaryIcon(item.dietary)}
                    <span className="text-[11px] font-mono text-zinc-400 capitalize">
                      {item.category}
                    </span>
                  </div>

                  {/* Live Stock Badge */}
                  <div>
                    {isSoldOut ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-crimson-danger/20 text-crimson-danger border border-crimson-danger/30">
                        SOLD OUT
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-electric/20 text-amber-electric border border-amber-electric/40 animate-pulse">
                        Only {item.availableStock} left!
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold font-mono bg-emerald-stock/15 text-emerald-stock border border-emerald-stock/30">
                        {item.availableStock} left
                      </span>
                    )}
                  </div>
                </div>

                {/* Item Name & Details */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-bold text-sm sm:text-base text-white tracking-tight">
                    {item.name}
                  </h4>
                  {item.badge && (
                    <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-amber-electric/10 text-amber-electric border border-amber-electric/20 font-medium">
                      {item.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-3">
                  {item.description}
                </p>
              </div>

              {/* Card Bottom: Price & Stepper CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-night-border/70 mt-2">
                <div className="text-base font-extrabold text-white font-mono">
                  ₹{item.price}
                </div>

                {/* Stepper / Add button */}
                <div>
                  {isSoldOut ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-500 text-xs font-semibold uppercase cursor-not-allowed min-h-[44px]"
                    >
                      Sold Out
                    </button>
                  ) : currentQty === 0 ? (
                    <button
                      onClick={() => addToCart(item)}
                      className="px-4 py-2 rounded-xl bg-amber-electric/15 hover:bg-amber-electric text-amber-electric hover:text-black border border-amber-electric/40 font-bold text-xs uppercase tracking-wider transition-all min-h-[44px] active:scale-95 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 bg-night-black border border-amber-electric/40 rounded-xl p-1 shadow-inner">
                      <button
                        onClick={() => updateCartQuantity(item.id, currentQty - 1)}
                        className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-colors min-h-[40px] min-w-[40px]"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-8 text-center font-mono font-bold text-sm text-amber-electric tabular-nums">
                        {currentQty}
                      </span>

                      <button
                        onClick={() => updateCartQuantity(item.id, currentQty + 1)}
                        disabled={currentQty >= item.availableStock}
                        className="w-10 h-10 rounded-lg bg-amber-electric hover:bg-amber-glow disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold flex items-center justify-center transition-colors min-h-[40px] min-w-[40px]"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Checkout Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-night-black/95 backdrop-blur-xl border-t border-night-border p-4 animate-slide-up shadow-2xl">
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Optional Roommate / Group Tag */}
            <div className="flex items-center gap-2 bg-night-card border border-night-border rounded-xl px-3 py-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-electric shrink-0" />
              <input
                type="text"
                placeholder="Room / Note (e.g., Room 304 - 2 spicy / extra onions)"
                value={roommateTag}
                onChange={(e) => setRoommateTag(e.target.value)}
                maxLength={60}
                className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none font-sans"
              />
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="p-2.5 rounded-lg bg-crimson-danger/20 border border-crimson-danger/40 text-xs text-crimson-danger flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Checkout Action Bar */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                </div>
                <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
                  ₹{totalAmount}.00
                </div>
              </div>

              <button
                onClick={handleOrderSubmit}
                disabled={isSubmitting}
                className="flex-1 max-w-xs py-3.5 px-5 bg-amber-electric hover:bg-amber-glow disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all min-h-[48px]"
              >
                {isSubmitting ? (
                  <span>Locking Stock...</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Request Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

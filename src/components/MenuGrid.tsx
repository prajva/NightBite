'use client';

import React, { useState } from 'react';
import { useNightBite } from '@/context/NightBiteContext';
import { useAuth } from '@/context/AuthContext';
import { MenuItem, DietaryType } from '@/types';
import {
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  Flame,
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

  const totalItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleOrderSubmit = async () => {
    if (!messStatus.isOpen) {
      setSubmitError(
        'Night mess is currently closed! (Strictly 10:30 PM - 12:00 AM IST). Toggle the Testing Override in the top clock pill to test ordering.'
      );
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

  const renderDietaryBadge = (dietary: DietaryType) => {
    switch (dietary) {
      case 'veg':
        return (
          <span className="w-3.5 h-3.5 border border-stock-green rounded-sm flex items-center justify-center p-0.5" title="Pure Veg">
            <span className="w-1.5 h-1.5 rounded-full bg-stock-green" />
          </span>
        );
      case 'non-veg':
        return (
          <span className="w-3.5 h-3.5 border border-stock-red rounded-sm flex items-center justify-center p-0.5" title="Non-Veg">
            <span className="w-1.5 h-1.5 rounded-full bg-stock-red" />
          </span>
        );
      case 'egg':
        return (
          <span className="w-3.5 h-3.5 border border-peach rounded-sm flex items-center justify-center p-0.5" title="Egg">
            <span className="w-1.5 h-1.5 rounded-full bg-peach" />
          </span>
        );
    }
  };

  return (
    <div className="pb-36 px-4 max-w-4xl mx-auto">
      {/* Category Pills Bar — Uber Minimalist */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 mb-4">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-peach text-black font-semibold shadow-sm'
                : 'bg-uber-surface text-zinc-400 border border-uber-border hover:text-white hover:border-zinc-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  ? 'bg-uber-surface/40 border-uber-border/40 opacity-50'
                  : 'bg-uber-surface border-uber-border hover:border-peach-border hover:bg-uber-cardHover shadow-lg'
              }`}
            >
              <div>
                {/* Header: Dietary & Stock Pill */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {renderDietaryBadge(item.dietary)}
                    <span className="text-[11px] font-mono text-zinc-400">
                      {item.category}
                    </span>
                  </div>

                  {/* Minimal Live Stock Pill */}
                  <div>
                    {isSoldOut ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-zinc-800 text-zinc-500">
                        Sold Out
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-peach-glow text-peach border border-peach-border animate-pulse">
                        Only {item.availableStock} left
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-stock-green/10 text-stock-green border border-stock-green/20">
                        {item.availableStock} in stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-bold text-sm text-white tracking-tight">
                    {item.name}
                  </h4>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-peach-glow text-peach border border-peach-border shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                  {item.description}
                </p>
              </div>

              {/* Bottom: Price & Button */}
              <div className="flex items-center justify-between pt-3 border-t border-uber-border mt-1">
                <div className="text-base font-extrabold text-white font-mono">
                  ₹{item.price}
                </div>

                <div>
                  {isSoldOut ? (
                    <span className="text-xs text-zinc-600 font-medium">Unavailable</span>
                  ) : currentQty === 0 ? (
                    <button
                      onClick={() => addToCart(item)}
                      className="px-3.5 py-1.5 rounded-full bg-uber-card hover:bg-peach text-zinc-200 hover:text-black border border-uber-border hover:border-peach text-xs font-semibold transition-all flex items-center gap-1 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 bg-black border border-peach-border rounded-full p-0.5">
                      <button
                        onClick={() => updateCartQuantity(item.id, currentQty - 1)}
                        className="w-7 h-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 flex items-center justify-center transition-colors text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-xs text-peach tabular-nums">
                        {currentQty}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, currentQty + 1)}
                        disabled={currentQty >= item.availableStock}
                        className="w-7 h-7 rounded-full bg-peach text-black font-bold flex items-center justify-center disabled:opacity-40 transition-colors text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Checkout Bar — Uber Style Peach & Black */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-2xl border-t border-uber-border p-4 animate-slide-up">
          <div className="max-w-4xl mx-auto space-y-2.5">
            {/* Roommate / Room Note Input */}
            <div className="flex items-center gap-2 bg-uber-surface border border-uber-border rounded-xl px-3 py-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-peach shrink-0" />
              <input
                type="text"
                placeholder="Room / Note (e.g., MH-2 304 - 2 spicy / extra tawa butter)"
                value={roommateTag}
                onChange={(e) => setRoommateTag(e.target.value)}
                maxLength={60}
                className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none"
              />
            </div>

            {submitError && (
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Price & Primary CTA */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase font-mono text-zinc-400">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                </div>
                <div className="text-xl font-extrabold text-white font-mono tabular-nums">
                  ₹{totalAmount}.00
                </div>
              </div>

              <button
                onClick={handleOrderSubmit}
                disabled={isSubmitting}
                className="flex-1 max-w-xs py-3 px-5 bg-peach hover:bg-peach-300 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-peach/20 active:scale-[0.98] transition-all min-h-[44px]"
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

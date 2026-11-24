'use client';

import React, { useState } from 'react';
import { useNightBite } from '@/context/NightBiteContext';
import { useAuth } from '@/context/AuthContext';
import { MenuItem } from '@/types';
import {
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  Leaf,
  Drumstick,
} from 'lucide-react';

const FILTER_TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'VEG', label: 'Pure Veg' },
  { id: 'NON_VEG', label: 'Non-Veg & Egg' },
  { id: 'Rolls', label: 'Rolls' },
  { id: 'Maggi & Noodles', label: 'Maggi' },
  { id: 'Snacks & Bites', label: 'Snacks' },
  { id: 'Beverages', label: 'Drinks' },
];

export function MenuGrid() {
  const { user } = useAuth();
  const {
    menuItems,
    cart,
    roommateTag,
    setRoommateTag,
    addToCart,
    updateCartQuantity,
    requestOrder,
    messStatus,
  } = useNightBite();

  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Filter items
  const vegItems = menuItems.filter((i) => i.dietary === 'veg');
  const nonVegItems = menuItems.filter((i) => i.dietary === 'non-veg' || i.dietary === 'egg');

  const getFilteredList = (list: MenuItem[]) => {
    if (activeFilter === 'ALL' || activeFilter === 'VEG' || activeFilter === 'NON_VEG') {
      return list;
    }
    return list.filter((i) => i.category === activeFilter);
  };

  const showVegSection = activeFilter === 'ALL' || activeFilter === 'VEG' || (activeFilter !== 'NON_VEG' && getFilteredList(vegItems).length > 0);
  const showNonVegSection = activeFilter === 'ALL' || activeFilter === 'NON_VEG' || (activeFilter !== 'VEG' && getFilteredList(nonVegItems).length > 0);

  const displayedVeg = getFilteredList(vegItems);
  const displayedNonVeg = getFilteredList(nonVegItems);

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

  const renderItemCard = (item: MenuItem) => {
    const cartItem = cart.find((i) => i.menuItemId === item.id);
    const currentQty = cartItem ? cartItem.quantity : 0;
    const isSoldOut = item.isSoldOut || item.availableStock <= 0;
    const isLowStock = !isSoldOut && item.availableStock <= 5;
    const isVeg = item.dietary === 'veg';

    return (
      <div
        key={item.id}
        className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
          isSoldOut
            ? 'bg-uber-surface/40 border-uber-border/40 opacity-50'
            : 'bg-uber-surface border-uber-border hover:border-peach-border hover:bg-uber-cardHover shadow-sm'
        }`}
      >
        <div>
          {/* Subtle Dietary Dot & Stock */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              {/* Subtle Muted Indicator (No loud green) */}
              <span
                className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center p-0.5 ${
                  isVeg
                    ? 'border-emerald-600/60 bg-emerald-950/20'
                    : 'border-rose-500/60 bg-rose-950/20'
                }`}
                title={isVeg ? 'Pure Veg' : 'Non-Veg'}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isVeg ? 'bg-emerald-500' : 'bg-rose-400'
                  }`}
                />
              </span>

              <span className="text-[11px] font-mono text-zinc-400">
                {item.category}
              </span>
            </div>

            {/* Subtle Stock Label */}
            <div>
              {isSoldOut ? (
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  Sold Out
                </span>
              ) : isLowStock ? (
                <span className="text-[10px] font-mono text-peach font-medium">
                  {item.availableStock} left
                </span>
              ) : (
                <span className="text-[10px] font-mono text-zinc-400">
                  {item.availableStock} available
                </span>
              )}
            </div>
          </div>

          {/* Name */}
          <h4 className="font-bold text-sm text-white tracking-tight mb-1">
            {item.name}
          </h4>

          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        </div>

        {/* Price & Stepper */}
        <div className="flex items-center justify-between pt-3 border-t border-uber-border">
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
  };

  return (
    <div className="pb-36 px-4 max-w-4xl mx-auto">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 mb-5">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeFilter === tab.id
                ? 'bg-peach text-black font-semibold shadow-sm'
                : 'bg-uber-surface text-zinc-400 border border-uber-border hover:text-white hover:border-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: PURE VEG SPECIALS */}
      {showVegSection && displayedVeg.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-uber-border">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
              Pure Veg Specials
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">
              ({displayedVeg.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayedVeg.map(renderItemCard)}
          </div>
        </div>
      )}

      {/* SECTION 2: NON-VEG & EGG SPECIALS */}
      {showNonVegSection && displayedNonVeg.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-uber-border">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
              Non-Veg &amp; Egg Specials
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">
              ({displayedNonVeg.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayedNonVeg.map(renderItemCard)}
          </div>
        </div>
      )}

      {/* Empty State */}
      {displayedVeg.length === 0 && displayedNonVeg.length === 0 && (
        <div className="text-center py-16 text-zinc-500 text-xs">
          No items found in this section.
        </div>
      )}

      {/* Sticky Bottom Checkout Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-2xl border-t border-uber-border p-4 animate-slide-up">
          <div className="max-w-4xl mx-auto space-y-2.5">
            {/* Room Note */}
            <div className="flex items-center gap-2 bg-uber-surface border border-uber-border rounded-xl px-3 py-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-peach shrink-0" />
              <input
                type="text"
                placeholder="MH-4 Room Note (e.g., Room 304 - 2 spicy / extra tawa butter)"
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

            {/* Price & Checkout */}
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
                className="flex-1 max-w-xs py-3 px-5 bg-peach hover:bg-peach-300 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all min-h-[44px]"
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

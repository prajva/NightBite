'use client';

import React, { useState } from 'react';
import { useNightBite } from '@/context/NightBiteContext';
import { useAuth } from '@/context/AuthContext';
import { Order, MenuItem, DietaryType } from '@/types';
import {
  Shield,
  Clock,
  Flame,
  PackageCheck,
  Sliders,
  DollarSign,
  FileSpreadsheet,
  Plus,
  Check,
  X,
  Sun,
  Lock,
} from 'lucide-react';

const DECLINE_REASONS = [
  'Item just finished',
  'Kitchen overloaded (15m backlog)',
  'Closing soon (last batch underway)',
  'Ingredients shortage',
];

export function AdminQueue() {
  const { user } = useAuth();
  const {
    orders,
    menuItems,
    adminAccept,
    adminDecline,
    adminConfirmPayment,
    adminMarkReady,
    adminHandover,
    adminToggleSoldOut,
    adminUpdateStock,
    adminAddMenuItem,
    wakeLockActive,
    toggleWakeLock,
  } = useNightBite();

  const [activeTab, setActiveTab] = useState<'INCOMING' | 'KITCHEN' | 'MENU_LEDGER'>('INCOMING');
  const [declineModalOrder, setDeclineModalOrder] = useState<Order | null>(null);
  const [customDeclineReason, setCustomDeclineReason] = useState('');
  const [handoverModalOrder, setHandoverModalOrder] = useState<Order | null>(null);
  const [handoverPinInput, setHandoverPinInput] = useState('');
  const [handoverError, setHandoverError] = useState<string | null>(null);

  // New Menu Item Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<MenuItem['category']>('Rolls');
  const [newItemPrice, setNewItemPrice] = useState('90');
  const [newItemStock, setNewItemStock] = useState('30');
  const [newItemDietary, setNewItemDietary] = useState<DietaryType>('veg');
  const [newItemDesc, setNewItemDesc] = useState('');

  // Order filters
  const pendingOrders = orders.filter((o) => o.status === 'PENDING_APPROVAL');
  const kitchenOrders = orders.filter((o) =>
    ['AWAITING_PAYMENT', 'PAYMENT_VERIFYING', 'PREPARING', 'READY_FOR_PICKUP'].includes(o.status)
  );
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');

  // Digital Ledger Calculations
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalItemsSold = completedOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0),
    0
  );

  const salesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  completedOrders.forEach((o) => {
    o.items.forEach((it) => {
      if (!salesMap[it.menuItemId]) {
        salesMap[it.menuItemId] = { name: it.name, qty: 0, revenue: 0 };
      }
      salesMap[it.menuItemId].qty += it.quantity;
      salesMap[it.menuItemId].revenue += it.price * it.quantity;
    });
  });

  const handleDeclineSubmit = (reason: string) => {
    if (!declineModalOrder) return;
    adminDecline(declineModalOrder.id, reason);
    setDeclineModalOrder(null);
    setCustomDeclineReason('');
  };

  const handleHandoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverModalOrder) return;
    const res = adminHandover(handoverModalOrder.id, handoverPinInput);
    if (res.success) {
      setHandoverModalOrder(null);
      setHandoverPinInput('');
      setHandoverError(null);
    } else {
      setHandoverError(res.error || 'Incorrect 4-digit PIN.');
    }
  };

  const handleAddMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    adminAddMenuItem({
      name: newItemName.trim(),
      category: newItemCategory,
      price: Number(newItemPrice) || 50,
      availableStock: Number(newItemStock) || 20,
      totalDailyStock: Number(newItemStock) || 20,
      isSoldOut: false,
      dietary: newItemDietary,
      description: newItemDesc.trim() || 'Late night mess freshly prepared roll.',
    });

    setNewItemName('');
    setNewItemDesc('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-28">
      {/* Admin Utility Header — Uber Driver Vibe */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-uber-surface border border-uber-border rounded-2xl mb-5 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-peach-glow text-peach border border-peach-border">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white">Staff Counter Face</h2>
            <p className="text-[11px] text-zinc-400 font-mono">
              Staff: {user?.email || 'admin@nightbite.ac.in'}
            </p>
          </div>
        </div>

        {/* Screen Awake Toggle */}
        <button
          onClick={toggleWakeLock}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-colors border ${
            wakeLockActive
              ? 'bg-stock-green/15 text-stock-green border-stock-green/30'
              : 'bg-black text-zinc-400 border-uber-border hover:text-white'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Screen Awake: {wakeLockActive ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-uber-border pb-3 mb-5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('INCOMING')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
            activeTab === 'INCOMING'
              ? 'bg-peach text-black shadow-sm'
              : 'bg-uber-surface text-zinc-400 hover:text-white border border-uber-border'
          }`}
        >
          <span>1. Incoming Queue</span>
          {pendingOrders.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-stock-red text-white text-[9px] flex items-center justify-center font-mono font-bold animate-pulse">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('KITCHEN')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
            activeTab === 'KITCHEN'
              ? 'bg-peach text-black shadow-sm'
              : 'bg-uber-surface text-zinc-400 hover:text-white border border-uber-border'
          }`}
        >
          <span>2. Payment &amp; Kitchen</span>
          {kitchenOrders.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-200 text-[9px] flex items-center justify-center font-mono">
              {kitchenOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('MENU_LEDGER')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
            activeTab === 'MENU_LEDGER'
              ? 'bg-peach text-black shadow-sm'
              : 'bg-uber-surface text-zinc-400 hover:text-white border border-uber-border'
          }`}
        >
          <span>3. Menu &amp; Ledger</span>
        </button>
      </div>

      {/* TAB 1: INCOMING QUEUE */}
      {activeTab === 'INCOMING' && (
        <div className="space-y-3.5 animate-fade-in">
          {pendingOrders.length === 0 ? (
            <div className="text-center py-16 bg-uber-surface border border-uber-border rounded-2xl p-6">
              <Clock className="w-10 h-10 text-zinc-600 mx-auto mb-2.5" />
              <h3 className="font-semibold text-white text-sm">No Pending Orders</h3>
              <p className="text-xs text-zinc-500 mt-1">
                New late-night student requests will chime here automatically.
              </p>
            </div>
          ) : (
            pendingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-uber-surface border border-peach-border rounded-2xl p-4 shadow-lg animate-slide-up"
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-extrabold text-peach font-mono">
                        #{order.tokenNumber}
                      </span>
                      <span className="text-xs font-semibold text-white">{order.studentName}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      {order.studentEmail}
                    </div>
                    {order.roommateTag && (
                      <div className="text-xs text-peach font-medium mt-1">
                        Note: &ldquo;{order.roommateTag}&rdquo;
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold text-white font-mono">
                      ₹{order.totalAmount}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {order.items.reduce((s, it) => s + it.quantity, 0)} items
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-black rounded-xl p-3 border border-uber-border space-y-1 mb-3.5">
                  {order.items.map((it) => (
                    <div key={it.menuItemId} className="flex justify-between text-xs text-zinc-300">
                      <span>
                        <strong className="text-peach">{it.quantity}x</strong> {it.name}
                      </span>
                      <span className="text-zinc-500 font-mono">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setDeclineModalOrder(order)}
                    className="py-2.5 px-3 rounded-xl bg-red-950/30 hover:bg-red-950/50 text-red-400 border border-red-500/30 text-xs font-semibold uppercase tracking-wider transition-colors min-h-[44px]"
                  >
                    Decline
                  </button>

                  <button
                    onClick={() => adminAccept(order.id)}
                    className="py-2.5 px-3 rounded-xl bg-peach hover:bg-peach-300 text-black font-bold text-xs uppercase tracking-wider transition-all min-h-[44px] shadow-md"
                  >
                    Accept (180s Pay)
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: KITCHEN & PAYMENT */}
      {activeTab === 'KITCHEN' && (
        <div className="space-y-3.5 animate-fade-in">
          {kitchenOrders.length === 0 ? (
            <div className="text-center py-16 bg-uber-surface border border-uber-border rounded-2xl p-6">
              <Flame className="w-10 h-10 text-zinc-600 mx-auto mb-2.5" />
              <h3 className="font-semibold text-white text-sm">Kitchen is Clear</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Accepted orders undergoing payment or cooking are tracked here.
              </p>
            </div>
          ) : (
            kitchenOrders.map((order) => {
              const isAwaitingPay = order.status === 'AWAITING_PAYMENT';
              const isVerifying = order.status === 'PAYMENT_VERIFYING';
              const isPreparing = order.status === 'PREPARING';
              const isReady = order.status === 'READY_FOR_PICKUP';

              return (
                <div
                  key={order.id}
                  className={`bg-uber-surface border rounded-2xl p-4 shadow-lg transition-all ${
                    isReady
                      ? 'border-stock-green/50 bg-stock-green/5'
                      : isVerifying
                      ? 'border-peach-border bg-peach/5'
                      : 'border-uber-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-extrabold text-peach font-mono">
                          #{order.tokenNumber}
                        </span>
                        <span className="text-xs font-semibold text-white">{order.studentName}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">{order.studentEmail}</div>
                      {order.roommateTag && (
                        <div className="text-xs text-zinc-300 mt-0.5">
                          Note: &ldquo;{order.roommateTag}&rdquo;
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          isAwaitingPay
                            ? 'bg-peach-glow text-peach border border-peach-border'
                            : isVerifying
                            ? 'bg-peach text-black'
                            : isPreparing
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-stock-green text-black font-bold'
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                      <div className="text-sm font-bold text-white font-mono mt-1">
                        ₹{order.totalAmount}
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-black rounded-xl p-2.5 border border-uber-border space-y-1 mb-3 text-xs text-zinc-300">
                    {order.items.map((it) => (
                      <div key={it.menuItemId} className="flex justify-between">
                        <span>
                          <strong className="text-peach">{it.quantity}x</strong> {it.name}
                        </span>
                        <span className="text-zinc-500 font-mono">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  {isAwaitingPay && (
                    <div className="p-2.5 rounded-xl bg-peach-glow border border-peach-border text-xs text-peach flex items-center gap-2">
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Student is paying via UPI (180s Auto-Release Active)</span>
                    </div>
                  )}

                  {isVerifying && (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-black border border-peach-border text-xs flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-zinc-400 font-mono uppercase">
                            Submitted 12-Digit UTR
                          </div>
                          <div className="text-sm font-mono font-bold text-white tracking-widest mt-0.5">
                            {order.utrNumber}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-stock-green/20 text-stock-green text-[10px] font-mono font-semibold">
                          Verified Format
                        </span>
                      </div>

                      <button
                        onClick={() => adminConfirmPayment(order.id)}
                        className="w-full py-2.5 rounded-xl bg-peach hover:bg-peach-300 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md min-h-[44px]"
                      >
                        <Flame className="w-4 h-4" />
                        <span>Confirm UTR &amp; Start Cooking</span>
                      </button>
                    </div>
                  )}

                  {isPreparing && (
                    <button
                      onClick={() => adminMarkReady(order.id)}
                      className="w-full py-2.5 rounded-xl bg-stock-green hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md min-h-[44px]"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Mark Ready (Alert Student Phone)</span>
                    </button>
                  )}

                  {isReady && (
                    <button
                      onClick={() => {
                        setHandoverModalOrder(order);
                        setHandoverPinInput('');
                        setHandoverError(null);
                      }}
                      className="w-full py-2.5 rounded-xl bg-stock-green hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md min-h-[44px]"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Verify Student PIN &amp; Handover</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: DAILY MENU & DIGITAL LEDGER */}
      {activeTab === 'MENU_LEDGER' && (
        <div className="space-y-5 animate-fade-in">
          {/* Sales Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-uber-surface border border-uber-border">
              <div className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
                Tonight&apos;s Revenue
              </div>
              <div className="text-2xl font-extrabold text-peach font-mono mt-1">
                ₹{totalRevenue}.00
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">UPI Collections</div>
            </div>

            <div className="p-4 rounded-2xl bg-uber-surface border border-uber-border">
              <div className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
                Orders Completed
              </div>
              <div className="text-2xl font-extrabold text-stock-green font-mono mt-1">
                {completedOrders.length}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Verified by PIN</div>
            </div>

            <div className="p-4 rounded-2xl bg-uber-surface border border-uber-border">
              <div className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
                Portions Sold
              </div>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">
                {totalItemsSold}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Rolls, maggi &amp; drinks</div>
            </div>
          </div>

          {/* Digital Mess Ledger Table */}
          <div className="p-4 rounded-2xl bg-uber-surface border border-uber-border">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-peach" />
              <span>Digital Mess Register (Item Breakdown)</span>
            </h3>

            {Object.keys(salesMap).length === 0 ? (
              <p className="text-xs text-zinc-500 py-3">No completed sales recorded tonight yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 font-mono text-[11px]">
                      <th className="pb-2">Item Name</th>
                      <th className="pb-2 text-center">Sold Qty</th>
                      <th className="pb-2 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-sans">
                    {Object.entries(salesMap).map(([id, row]) => (
                      <tr key={id} className="text-zinc-200">
                        <td className="py-2 font-medium">{row.name}</td>
                        <td className="py-2 text-center font-mono font-semibold text-peach">
                          {row.qty}
                        </td>
                        <td className="py-2 text-right font-mono font-semibold text-white">
                          ₹{row.revenue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Live Stock Control */}
          <div className="p-4 rounded-2xl bg-uber-surface border border-uber-border">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-peach" />
              <span>Live Stock Control &amp; Sold Out Toggles</span>
            </h3>

            <div className="space-y-2">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-black border border-uber-border gap-2 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-white truncate">{item.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">₹{item.price} • {item.category}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900">
                      <button
                        onClick={() => adminUpdateStock(item.id, item.availableStock - 1)}
                        className="px-2 py-0.5 hover:bg-zinc-800 text-zinc-400 font-mono"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 font-mono font-bold text-peach tabular-nums text-xs">
                        {item.availableStock}
                      </span>
                      <button
                        onClick={() => adminUpdateStock(item.id, item.availableStock + 1)}
                        className="px-2 py-0.5 hover:bg-zinc-800 text-zinc-400 font-mono"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => adminToggleSoldOut(item.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-colors ${
                        item.isSoldOut
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {item.isSoldOut ? 'SOLD OUT' : 'AVAILABLE'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Decline Reason Pill Modal */}
      {declineModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-uber-surface border border-red-500/40 rounded-2xl max-w-sm w-full p-5 text-white shadow-2xl">
            <h3 className="font-bold text-sm text-white mb-1">Select Decline Reason</h3>
            <p className="text-xs text-zinc-400 mb-3">
              Order #{declineModalOrder.tokenNumber} ({declineModalOrder.studentName}). Items will be immediately released.
            </p>

            <div className="space-y-1.5 mb-3">
              {DECLINE_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleDeclineSubmit(reason)}
                  className="w-full text-left p-2 rounded-xl bg-black border border-zinc-800 hover:border-red-500 text-xs text-zinc-200 transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDeclineModalOrder(null)}
                className="py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeclineSubmit(customDeclineReason || 'Kitchen unavailable')}
                className="py-2 rounded-xl bg-red-600 text-white text-xs font-bold uppercase"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handover PIN Modal */}
      {handoverModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-uber-surface border border-stock-green/40 rounded-2xl max-w-sm w-full p-5 text-white shadow-2xl">
            <h3 className="font-bold text-sm text-white mb-1">Verify Student Pickup PIN</h3>
            <p className="text-xs text-zinc-400 mb-3">
              Ask student for the 4-digit PIN on their phone for Order #{handoverModalOrder.tokenNumber}.
            </p>

            <form onSubmit={handleHandoverSubmit} className="space-y-3">
              <input
                type="text"
                maxLength={4}
                autoFocus
                placeholder="4-Digit PIN"
                value={handoverPinInput}
                onChange={(e) => {
                  setHandoverPinInput(e.target.value.replace(/\D/g, ''));
                  setHandoverError(null);
                }}
                className="w-full text-center tracking-widest text-2xl font-mono font-black py-2.5 rounded-xl bg-black border border-zinc-800 focus:border-stock-green text-white"
              />

              {handoverError && (
                <div className="p-2 rounded-lg bg-red-950/40 border border-red-500/40 text-xs text-red-300">
                  {handoverError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setHandoverModalOrder(null)}
                  className="py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={handoverPinInput.length !== 4}
                  className="py-2 rounded-xl bg-stock-green hover:bg-emerald-400 disabled:opacity-40 text-black text-xs font-bold uppercase"
                >
                  Verify &amp; Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

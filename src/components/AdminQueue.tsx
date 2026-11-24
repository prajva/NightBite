'use client';

import React, { useState } from 'react';
import { useNightBite } from '@/context/NightBiteContext';
import { useAuth } from '@/context/AuthContext';
import { Order, MenuItem, DietaryType } from '@/types';
import {
  Shield,
  Eye,
  Check,
  X,
  Clock,
  Flame,
  PackageCheck,
  Sliders,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  Plus,
  RefreshCw,
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

  // Itemized sales breakdown
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
      setHandoverError(res.error || 'Incorrect PIN.');
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
      {/* Admin Top Utility Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-night-card border border-night-border rounded-2xl mb-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-electric/15 text-amber-electric">
              <Shield className="w-4 h-4" />
            </span>
            <h2 className="font-bold text-sm text-white">Mess Counter Dashboard</h2>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Admin: {user?.email || 'messadmin@vitap.ac.in'}
          </p>
        </div>

        {/* Screen Wake Lock Button */}
        <button
          onClick={toggleWakeLock}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-colors border ${
            wakeLockActive
              ? 'bg-emerald-stock/20 text-emerald-stock border-emerald-stock/40'
              : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Screen Awake: {wakeLockActive ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-night-border pb-3 mb-5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('INCOMING')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
            activeTab === 'INCOMING'
              ? 'bg-amber-electric text-black shadow-lg shadow-amber-500/20'
              : 'bg-night-card text-zinc-400 hover:text-white border border-night-border'
          }`}
        >
          <span>1. Incoming Queue</span>
          {pendingOrders.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-crimson-danger text-white text-[10px] flex items-center justify-center font-mono font-bold animate-pulse">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('KITCHEN')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
            activeTab === 'KITCHEN'
              ? 'bg-amber-electric text-black shadow-lg shadow-amber-500/20'
              : 'bg-night-card text-zinc-400 hover:text-white border border-night-border'
          }`}
        >
          <span>2. Payment &amp; Kitchen</span>
          {kitchenOrders.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-zinc-700 text-white text-[10px] flex items-center justify-center font-mono">
              {kitchenOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('MENU_LEDGER')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
            activeTab === 'MENU_LEDGER'
              ? 'bg-amber-electric text-black shadow-lg shadow-amber-500/20'
              : 'bg-night-card text-zinc-400 hover:text-white border border-night-border'
          }`}
        >
          <span>3. Daily Menu &amp; Ledger</span>
        </button>
      </div>

      {/* TAB 1: INCOMING QUEUE */}
      {activeTab === 'INCOMING' && (
        <div className="space-y-4 animate-fade-in">
          {pendingOrders.length === 0 ? (
            <div className="text-center py-16 bg-night-card border border-night-border rounded-2xl p-6">
              <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-semibold text-white text-base">Incoming Queue is Clean</h3>
              <p className="text-xs text-zinc-400 mt-1">
                New student requests will appear here with an instant audio chime.
              </p>
            </div>
          ) : (
            pendingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-night-card border border-amber-electric/40 rounded-2xl p-4 sm:p-5 shadow-xl animate-slide-up"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-amber-electric font-mono">
                        #{order.tokenNumber}
                      </span>
                      <span className="text-xs font-semibold text-white">{order.studentName}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      {order.studentEmail}
                    </div>
                    {order.roommateTag && (
                      <div className="text-xs text-amber-electric font-medium mt-1">
                        Room/Note: &ldquo;{order.roommateTag}&rdquo;
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-white font-mono">
                      ₹{order.totalAmount}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {order.items.reduce((s, it) => s + it.quantity, 0)} items
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="bg-night-black rounded-xl p-3 border border-zinc-800 space-y-1.5 mb-4">
                  {order.items.map((it) => (
                    <div key={it.menuItemId} className="flex justify-between text-xs text-zinc-200">
                      <span className="font-medium">
                        <span className="text-amber-electric font-bold font-mono">{it.quantity}x</span>{' '}
                        {it.name}
                      </span>
                      <span className="text-zinc-400 font-mono">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Accept / Decline CTAs */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDeclineModalOrder(order)}
                    className="py-3 px-4 rounded-xl bg-crimson-danger/15 hover:bg-crimson-danger/25 text-crimson-danger border border-crimson-danger/40 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors min-h-[48px]"
                  >
                    <X className="w-4 h-4" />
                    <span>Decline</span>
                  </button>

                  <button
                    onClick={() => adminAccept(order.id)}
                    className="py-3 px-4 rounded-xl bg-emerald-stock hover:bg-emerald-glow text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-transform min-h-[48px]"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept (180s Pay)</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: PAYMENT & KITCHEN */}
      {activeTab === 'KITCHEN' && (
        <div className="space-y-4 animate-fade-in">
          {kitchenOrders.length === 0 ? (
            <div className="text-center py-16 bg-night-card border border-night-border rounded-2xl p-6">
              <Flame className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-semibold text-white text-base">Kitchen is Clear</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Accepted orders undergoing payment or cooking will be tracked here.
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
                  className={`bg-night-card border rounded-2xl p-4 sm:p-5 shadow-xl transition-all ${
                    isReady
                      ? 'border-emerald-stock/60 bg-emerald-stock/5'
                      : isVerifying
                      ? 'border-amber-electric/60 bg-amber-electric/5'
                      : 'border-night-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-amber-electric font-mono">
                          #{order.tokenNumber}
                        </span>
                        <span className="text-xs font-semibold text-white">{order.studentName}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">{order.studentEmail}</div>
                      {order.roommateTag && (
                        <div className="text-xs text-zinc-300 mt-1">
                          Tag: &ldquo;{order.roommateTag}&rdquo;
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono uppercase ${
                          isAwaitingPay
                            ? 'bg-amber-electric/20 text-amber-electric'
                            : isVerifying
                            ? 'bg-amber-electric text-black animate-pulse'
                            : isPreparing
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-emerald-stock text-black font-extrabold'
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
                  <div className="bg-night-black rounded-xl p-3 border border-zinc-800 space-y-1 mb-3 text-xs text-zinc-200">
                    {order.items.map((it) => (
                      <div key={it.menuItemId} className="flex justify-between">
                        <span>
                          <strong className="text-amber-electric">{it.quantity}x</strong> {it.name}
                        </span>
                        <span className="text-zinc-500">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Status Specific Actions */}
                  {isAwaitingPay && (
                    <div className="p-3 rounded-xl bg-amber-electric/10 border border-amber-electric/20 text-xs text-amber-electric flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Student is paying via UPI (180s Auto-Release Active)</span>
                      </div>
                    </div>
                  )}

                  {isVerifying && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-amber-electric/15 border border-amber-electric/40 text-xs flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-zinc-400 font-mono uppercase">
                            Submitted UTR / Transaction ID
                          </div>
                          <div className="text-sm font-mono font-bold text-white tracking-widest mt-0.5">
                            {order.utrNumber}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-stock/20 text-emerald-stock text-[10px] font-mono font-semibold">
                          Verified Format
                        </span>
                      </div>

                      <button
                        onClick={() => adminConfirmPayment(order.id)}
                        className="w-full py-3 rounded-xl bg-amber-electric hover:bg-amber-glow text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 min-h-[48px]"
                      >
                        <Flame className="w-4 h-4" />
                        <span>Confirm UTR &amp; Start Cooking</span>
                      </button>
                    </div>
                  )}

                  {isPreparing && (
                    <button
                      onClick={() => adminMarkReady(order.id)}
                      className="w-full py-3 rounded-xl bg-emerald-stock hover:bg-emerald-glow text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 min-h-[48px]"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Mark Ready (Alert Student Phone)</span>
                    </button>
                  )}

                  {isReady && (
                    <div className="space-y-2">
                      <div className="p-3 bg-emerald-stock/15 rounded-xl border border-emerald-stock/40 text-xs text-emerald-stock flex items-center justify-between">
                        <span className="font-semibold">Ready at Counter • Waiting for Pickup</span>
                        <span className="font-mono text-zinc-400">PIN on Student Screen</span>
                      </div>

                      <button
                        onClick={() => {
                          setHandoverModalOrder(order);
                          setHandoverPinInput('');
                          setHandoverError(null);
                        }}
                        className="w-full py-3 rounded-xl bg-emerald-stock hover:bg-emerald-glow text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 min-h-[48px]"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Verify PIN &amp; Handover Food</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: DAILY MENU & DIGITAL LEDGER */}
      {activeTab === 'MENU_LEDGER' && (
        <div className="space-y-6 animate-fade-in">
          {/* Real-time Ledger Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-night-card border border-night-border">
              <div className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
                Total Revenue Tonight
              </div>
              <div className="text-2xl font-black text-amber-electric font-mono mt-1">
                ₹{totalRevenue}.00
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">Direct UPI collections</div>
            </div>

            <div className="p-4 rounded-2xl bg-night-card border border-night-border">
              <div className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
                Orders Handed Over
              </div>
              <div className="text-2xl font-black text-emerald-stock font-mono mt-1">
                {completedOrders.length}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">Verified with 4-digit PINs</div>
            </div>

            <div className="p-4 rounded-2xl bg-night-card border border-night-border">
              <div className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
                Total Portions Sold
              </div>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {totalItemsSold}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">Rolls, maggi &amp; drinks</div>
            </div>
          </div>

          {/* Itemized Sales Register */}
          <div className="p-5 rounded-2xl bg-night-card border border-night-border">
            <h3 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-electric" />
              <span>Digital Mess Register (Item Breakdown)</span>
            </h3>

            {Object.keys(salesMap).length === 0 ? (
              <p className="text-xs text-zinc-500 py-3">No completed sales recorded tonight yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                      <th className="pb-2">Item Name</th>
                      <th className="pb-2 text-center">Sold Qty</th>
                      <th className="pb-2 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-sans">
                    {Object.entries(salesMap).map(([id, row]) => (
                      <tr key={id} className="text-zinc-200">
                        <td className="py-2.5 font-medium">{row.name}</td>
                        <td className="py-2.5 text-center font-mono font-semibold text-amber-electric">
                          {row.qty}
                        </td>
                        <td className="py-2.5 text-right font-mono font-semibold text-white">
                          ₹{row.revenue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Menu Stock & Emergency Sold Out Control */}
          <div className="p-5 rounded-2xl bg-night-card border border-night-border">
            <h3 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-electric" />
              <span>Live Stock Control &amp; Sold Out Toggles</span>
            </h3>

            <div className="space-y-3">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-night-black border border-zinc-800 gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white truncate">{item.name}</div>
                    <div className="text-[11px] text-zinc-400 font-mono">₹{item.price} • {item.category}</div>
                  </div>

                  {/* Stock Editor */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900">
                      <button
                        onClick={() => adminUpdateStock(item.id, item.availableStock - 1)}
                        className="px-2 py-1 hover:bg-zinc-800 text-zinc-300 font-mono"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-1 font-mono font-bold text-amber-electric tabular-nums text-xs">
                        {item.availableStock}
                      </span>
                      <button
                        onClick={() => adminUpdateStock(item.id, item.availableStock + 1)}
                        className="px-2 py-1 hover:bg-zinc-800 text-zinc-300 font-mono"
                      >
                        +
                      </button>
                    </div>

                    {/* Instant Sold Out Toggle */}
                    <button
                      onClick={() => adminToggleSoldOut(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                        item.isSoldOut
                          ? 'bg-crimson-danger text-white'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {item.isSoldOut ? 'SOLD OUT' : 'AVAILABLE'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Today's Item Form */}
          <div className="p-5 rounded-2xl bg-night-card border border-night-border">
            <h3 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-electric" />
              <span>Add Today&apos;s Special Item</span>
            </h3>

            <form onSubmit={handleAddMenuItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schezwan Egg Frankie"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-night-black border border-night-border text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as MenuItem['category'])}
                    className="w-full px-3 py-2 rounded-xl bg-night-black border border-night-border text-white text-xs"
                  >
                    <option value="Rolls">Rolls</option>
                    <option value="Maggi &amp; Noodles">Maggi &amp; Noodles</option>
                    <option value="Snacks &amp; Bites">Snacks &amp; Bites</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-night-black border border-night-border text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Initial Stock Count</label>
                  <input
                    type="number"
                    required
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-night-black border border-night-border text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Dietary Type</label>
                  <select
                    value={newItemDietary}
                    onChange={(e) => setNewItemDietary(e.target.value as DietaryType)}
                    className="w-full px-3 py-2 rounded-xl bg-night-black border border-night-border text-white text-xs"
                  >
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-Veg</option>
                    <option value="egg">Egg</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Short Description</label>
                  <input
                    type="text"
                    placeholder="Crispy and hot rolled in tawa paratha"
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-night-black border border-night-border text-white text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-electric hover:bg-amber-glow text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item to Tonight&apos;s Menu</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Decline Reason Pill Modal */}
      {declineModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-night-card border border-crimson-danger/50 rounded-2xl max-w-sm w-full p-6 text-white shadow-2xl">
            <h3 className="font-bold text-base text-white mb-1">Select Decline Reason</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Order #{declineModalOrder.tokenNumber} ({declineModalOrder.studentName}). Items will be immediately released.
            </p>

            <div className="space-y-2 mb-4">
              {DECLINE_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleDeclineSubmit(reason)}
                  className="w-full text-left p-2.5 rounded-xl bg-night-black border border-zinc-800 hover:border-crimson-danger text-xs text-zinc-200 transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Or type custom decline note..."
                value={customDeclineReason}
                onChange={(e) => setCustomDeclineReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-night-black border border-zinc-800 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDeclineModalOrder(null)}
                className="py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeclineSubmit(customDeclineReason || 'Kitchen unavailable')}
                className="py-2.5 rounded-xl bg-crimson-danger text-white text-xs font-bold uppercase"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handover PIN Modal */}
      {handoverModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-night-card border border-emerald-stock/50 rounded-2xl max-w-sm w-full p-6 text-white shadow-2xl">
            <h3 className="font-bold text-base text-white mb-1">Verify Student Pickup PIN</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Ask student for the 4-digit PIN displayed on their phone screen for Order #{handoverModalOrder.tokenNumber}.
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
                className="w-full text-center tracking-widest text-2xl font-mono font-black py-3 rounded-xl bg-night-black border border-zinc-800 focus:border-emerald-stock text-white"
              />

              {handoverError && (
                <div className="p-2.5 rounded-lg bg-crimson-danger/20 border border-crimson-danger/40 text-xs text-crimson-danger">
                  {handoverError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHandoverModalOrder(null)}
                  className="py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={handoverPinInput.length !== 4}
                  className="py-2.5 rounded-xl bg-emerald-stock hover:bg-emerald-glow disabled:opacity-50 text-black text-xs font-bold uppercase"
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

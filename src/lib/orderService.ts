import {
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  StockConflictDetail,
} from '@/types';
import { INITIAL_MENU_ITEMS } from './initialMenu';
import { sound } from './soundEffects';

const STORAGE_KEY_MENU = 'nightbite_menu_items_v1';
const STORAGE_KEY_ORDERS = 'nightbite_orders_v1';
const STORAGE_KEY_TOKEN = 'nightbite_token_counter_v1';

export class StockConflictError extends Error {
  detail: StockConflictDetail;
  constructor(detail: StockConflictDetail) {
    super(`Stock conflict for ${detail.itemName}: requested ${detail.requestedQty}, only ${detail.availableQty} left.`);
    this.name = 'StockConflictError';
    this.detail = detail;
  }
}

export class DuplicateUtrError extends Error {
  existingOrderId: string;
  constructor(utr: string, existingOrderId: string) {
    super(`Duplicate UTR ${utr} detected in order #${existingOrderId}`);
    this.name = 'DuplicateUtrError';
    this.existingOrderId = existingOrderId;
  }
}

// Global broadcast channel for instant multi-tab sync in dev/demo
let channel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    channel = new BroadcastChannel('nightbite_sync_v1');
  } catch {}
}

export function broadcastEvent(type: string, payload?: unknown) {
  if (channel) {
    try {
      channel.postMessage({ type, payload, timestamp: Date.now() });
    } catch {}
  }
}

export function subscribeToSync(callback: (event: { type: string; payload?: unknown }) => void): () => void {
  if (!channel && typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel('nightbite_sync_v1');
    } catch {}
  }

  const handler = (e: MessageEvent) => {
    callback(e.data);
  };

  if (channel) {
    channel.addEventListener('message', handler);
  }

  // Also listen for storage events across tabs
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY_MENU) {
      callback({ type: 'STOCK_UPDATED' });
    } else if (e.key === STORAGE_KEY_ORDERS) {
      callback({ type: 'ORDERS_UPDATED' });
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', storageHandler);
  }

  return () => {
    if (channel) {
      channel.removeEventListener('message', handler);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', storageHandler);
    }
  };
}

// Generate random 4-digit pickup PIN e.g. "8392"
export function generatePickupPin(): string {
  const pin = Math.floor(1000 + Math.random() * 9000);
  return String(pin);
}

// Read Menu Items
export function getStoredMenu(): MenuItem[] {
  if (typeof window === 'undefined') return INITIAL_MENU_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MENU);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(INITIAL_MENU_ITEMS));
      return INITIAL_MENU_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MENU_ITEMS;
  }
}

// Save Menu Items
export function saveStoredMenu(items: MenuItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(items));
    broadcastEvent('STOCK_UPDATED', items);
  } catch {}
}

// Read Orders
export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Save Orders
export function saveStoredOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    broadcastEvent('ORDERS_UPDATED', orders);
  } catch {}
}

// Get next token counter
function getNextTokenNumber(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const current = Number(localStorage.getItem(STORAGE_KEY_TOKEN) || '0');
    const next = current + 1;
    localStorage.setItem(STORAGE_KEY_TOKEN, String(next));
    return next;
  } catch {
    return Math.floor(Math.random() * 90) + 10;
  }
}

/**
 * 1. UNRESERVED CART, ATOMIC SUBMIT:
 * Stock is locked at the millisecond of tapping "Request Order".
 * If another student locked stock milliseconds earlier leaving fewer items than requested,
 * this throws a StockConflictError with the exact remaining stock.
 */
export async function createAtomicOrder({
  studentId,
  studentEmail,
  studentName,
  items,
  roommateTag,
}: {
  studentId: string;
  studentEmail: string;
  studentName: string;
  items: OrderItem[];
  roommateTag?: string;
}): Promise<Order> {
  const currentMenu = getStoredMenu();

  // Validate stock atomically
  for (const requestedItem of items) {
    const menuItem = currentMenu.find((m) => m.id === requestedItem.menuItemId);
    if (!menuItem) {
      throw new Error(`Item ${requestedItem.name} is no longer on the menu.`);
    }

    if (menuItem.isSoldOut || menuItem.availableStock < requestedItem.quantity) {
      throw new StockConflictError({
        itemId: menuItem.id,
        itemName: menuItem.name,
        requestedQty: requestedItem.quantity,
        availableQty: Math.max(0, menuItem.availableStock),
      });
    }
  }

  // Deduct stock
  const updatedMenu = currentMenu.map((m) => {
    const matched = items.find((req) => req.menuItemId === m.id);
    if (matched) {
      const remaining = m.availableStock - matched.quantity;
      return {
        ...m,
        availableStock: remaining,
        isSoldOut: remaining <= 0,
        updatedAt: Date.now(),
      };
    }
    return m;
  });

  saveStoredMenu(updatedMenu);

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tokenNumber = getNextTokenNumber();
  const pickupPin = generatePickupPin();

  const newOrder: Order = {
    id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    tokenNumber,
    pickupPin,
    studentId,
    studentEmail,
    studentName,
    items,
    totalAmount,
    roommateTag: roommateTag?.trim() || undefined,
    status: 'PENDING_APPROVAL',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const currentOrders = getStoredOrders();
  saveStoredOrders([newOrder, ...currentOrders]);

  broadcastEvent('NEW_ORDER_CREATED', newOrder);

  return newOrder;
}

/**
 * 2. ADMIN ACCEPTS ORDER:
 * Starts the payment countdown:
 * 180s (3 mins) for standard orders, or 150s (2.5 mins) for large orders of 4+ items.
 */
export function adminAcceptOrder(orderId: string): Order | null {
  const orders = getStoredOrders();
  const orderIndex = orders.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) return null;

  const order = orders[orderIndex];
  if (order.status !== 'PENDING_APPROVAL') return order;

  const totalItemCount = order.items.reduce((acc, it) => acc + it.quantity, 0);
  const countdownSeconds = totalItemCount >= 4 ? 150 : 180;
  const paymentDeadline = Date.now() + countdownSeconds * 1000;

  const updatedOrder: Order = {
    ...order,
    status: 'AWAITING_PAYMENT',
    paymentDeadline,
    approvedAt: Date.now(),
    updatedAt: Date.now(),
  };

  orders[orderIndex] = updatedOrder;
  saveStoredOrders(orders);
  broadcastEvent('ORDER_ACCEPTED', updatedOrder);
  return updatedOrder;
}

/**
 * 3. ADMIN DECLINES ORDER:
 * Immediately releases soft-locked stock back to available stock.
 */
export function adminDeclineOrder(orderId: string, reason: string): Order | null {
  const orders = getStoredOrders();
  const orderIndex = orders.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) return null;

  const order = orders[orderIndex];
  if (order.status === 'DECLINED' || order.status === 'COMPLETED' || order.status === 'EXPIRED') {
    return order;
  }

  // Release stock back
  releaseOrderStock(order.items);

  const updatedOrder: Order = {
    ...order,
    status: 'DECLINED',
    declineReason: reason,
    updatedAt: Date.now(),
  };

  orders[orderIndex] = updatedOrder;
  saveStoredOrders(orders);
  broadcastEvent('ORDER_DECLINED', updatedOrder);
  return updatedOrder;
}

/**
 * 4. STUDENT SUBMITS UPI PAYMENT:
 * Checks for duplicate 12-digit UTR across all orders to prevent fake screenshots.
 */
export function submitOrderPayment(orderId: string, utrNumber: string): Order | null {
  const cleanUtr = utrNumber.trim();
  if (cleanUtr.length !== 12 || !/^\d{12}$/.test(cleanUtr)) {
    throw new Error('Please enter a valid 12-digit UPI Transaction / UTR number.');
  }

  const orders = getStoredOrders();
  const duplicate = orders.find((o) => o.id !== orderId && o.utrNumber === cleanUtr);
  if (duplicate) {
    throw new DuplicateUtrError(cleanUtr, String(duplicate.tokenNumber));
  }

  const orderIndex = orders.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) return null;

  const order = orders[orderIndex];
  if (order.status !== 'AWAITING_PAYMENT') {
    throw new Error(`Cannot submit payment for order in status: ${order.status}`);
  }

  const updatedOrder: Order = {
    ...order,
    status: 'PAYMENT_VERIFYING',
    utrNumber: cleanUtr,
    paymentSubmittedAt: Date.now(),
    updatedAt: Date.now(),
  };

  orders[orderIndex] = updatedOrder;
  saveStoredOrders(orders);
  broadcastEvent('PAYMENT_SUBMITTED', updatedOrder);
  return updatedOrder;
}

/**
 * 5. ADMIN CONFIRMS UTR & STARTS PREPARATION
 */
export function adminConfirmPayment(orderId: string): Order | null {
  const orders = getStoredOrders();
  const orderIndex = orders.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) return null;

  const order = orders[orderIndex];
  const updatedOrder: Order = {
    ...order,
    status: 'PREPARING',
    paidAt: Date.now(),
    updatedAt: Date.now(),
  };

  orders[orderIndex] = updatedOrder;
  saveStoredOrders(orders);
  broadcastEvent('ORDER_PREPARING', updatedOrder);
  return updatedOrder;
}

/**
 * 6. ADMIN MARKS ORDER READY FOR PICKUP
 * Triggers student phone sound and alert.
 */
export function adminMarkReady(orderId: string): Order | null {
  const orders = getStoredOrders();
  const orderIndex = orders.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) return null;

  const order = orders[orderIndex];
  const updatedOrder: Order = {
    ...order,
    status: 'READY_FOR_PICKUP',
    readyAt: Date.now(),
    updatedAt: Date.now(),
  };

  orders[orderIndex] = updatedOrder;
  saveStoredOrders(orders);
  broadcastEvent('ORDER_READY', updatedOrder);
  return updatedOrder;
}

/**
 * 7. ADMIN VERIFIES 4-DIGIT PIN & HANDS OVER FOOD
 */
export function adminVerifyPinAndComplete(orderId: string, enteredPin: string): { success: boolean; order?: Order; error?: string } {
  const orders = getStoredOrders();
  const orderIndex = orders.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) return { success: false, error: 'Order not found.' };

  const order = orders[orderIndex];
  if (order.pickupPin !== enteredPin.trim()) {
    return { success: false, error: 'Incorrect 4-digit PIN! Please check student screen.' };
  }

  const updatedOrder: Order = {
    ...order,
    status: 'COMPLETED',
    completedAt: Date.now(),
    updatedAt: Date.now(),
  };

  orders[orderIndex] = updatedOrder;
  saveStoredOrders(orders);
  broadcastEvent('ORDER_COMPLETED', updatedOrder);
  return { success: true, order: updatedOrder };
}

/**
 * 8. AUTO-RELEASE TIMER (GHOST RESERVATION PROTECTION):
 * Evaluates all AWAITING_PAYMENT orders. If Date.now() > paymentDeadline,
 * the order expires and reserved stock is immediately restored to available stock.
 */
export function checkAndExpireAwaitingPaymentOrders(): { expiredOrders: Order[]; freedItems: { name: string; qty: number }[] } {
  const orders = getStoredOrders();
  const now = Date.now();
  const expiredOrders: Order[] = [];
  const freedItems: { name: string; qty: number }[] = [];

  let menuChanged = false;
  const menu = getStoredMenu();

  const updatedOrders = orders.map((order) => {
    if (order.status === 'AWAITING_PAYMENT' && order.paymentDeadline && now > order.paymentDeadline) {
      // Order has expired! Return items to stock
      for (const it of order.items) {
        const menuItem = menu.find((m) => m.id === it.menuItemId);
        if (menuItem) {
          menuItem.availableStock += it.quantity;
          menuItem.isSoldOut = false;
          menuItem.updatedAt = now;
          menuChanged = true;
          freedItems.push({ name: it.name, qty: it.quantity });
        }
      }

      const expiredOrder: Order = {
        ...order,
        status: 'EXPIRED',
        updatedAt: now,
      };
      expiredOrders.push(expiredOrder);
      return expiredOrder;
    }
    return order;
  });

  if (expiredOrders.length > 0) {
    saveStoredOrders(updatedOrders);
    if (menuChanged) {
      saveStoredMenu(menu);
      broadcastEvent('STOCK_FREED_UP', freedItems);
    }
  }

  return { expiredOrders, freedItems };
}

// Helper: release items back to menu stock
function releaseOrderStock(items: OrderItem[]): void {
  const menu = getStoredMenu();
  let changed = false;

  for (const it of items) {
    const menuItem = menu.find((m) => m.id === it.menuItemId);
    if (menuItem) {
      menuItem.availableStock += it.quantity;
      menuItem.isSoldOut = false;
      menuItem.updatedAt = Date.now();
      changed = true;
    }
  }

  if (changed) {
    saveStoredMenu(menu);
    broadcastEvent('STOCK_FREED_UP', items.map((i) => ({ name: i.name, qty: i.quantity })));
  }
}

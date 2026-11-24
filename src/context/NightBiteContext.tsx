'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  CartItem,
  MenuItem,
  Order,
  StockConflictDetail,
  MessOperatingStatus,
} from '@/types';
import {
  getStoredMenu,
  saveStoredMenu,
  getStoredOrders,
  saveStoredOrders,
  createAtomicOrder,
  adminAcceptOrder as apiAdminAccept,
  adminDeclineOrder as apiAdminDecline,
  submitOrderPayment as apiSubmitPayment,
  adminConfirmPayment as apiConfirmPayment,
  adminMarkReady as apiMarkReady,
  adminVerifyPinAndComplete as apiHandover,
  checkAndExpireAwaitingPaymentOrders,
  subscribeToSync,
  StockConflictError,
  DuplicateUtrError,
} from '@/lib/orderService';
import { getMessOperatingStatus } from '@/lib/messHours';
import { sound } from '@/lib/soundEffects';
import { useAuth } from './AuthContext';

interface NightBiteContextType {
  menuItems: MenuItem[];
  cart: CartItem[];
  roommateTag: string;
  activeOrder: Order | null;
  orders: Order[];
  messStatus: MessOperatingStatus;
  stockConflict: StockConflictDetail | null;
  stockFreedToast: string | null;
  wakeLockActive: boolean;
  selectedCategory: string;
  upiModalOpen: boolean;
  // Actions
  setSelectedCategory: (cat: string) => void;
  setRoommateTag: (tag: string) => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  requestOrder: () => Promise<Order | null>;
  resolveConflictAndUpdateCart: (itemId: string, availableQty: number, autoRetry?: boolean) => Promise<void>;
  dismissStockConflict: () => void;
  dismissStockFreedToast: () => void;
  setUpiModalOpen: (open: boolean) => void;
  submitUtr: (orderId: string, utr: string) => Promise<void>;
  // Admin Actions
  adminAccept: (orderId: string) => void;
  adminDecline: (orderId: string, reason: string) => void;
  adminConfirmPayment: (orderId: string) => void;
  adminMarkReady: (orderId: string) => void;
  adminHandover: (orderId: string, pin: string) => { success: boolean; error?: string };
  adminToggleSoldOut: (itemId: string) => void;
  adminUpdateStock: (itemId: string, newStock: number) => void;
  adminAddMenuItem: (item: Omit<MenuItem, 'id' | 'updatedAt'>) => void;
  toggleMessHoursOverride: () => void;
  toggleWakeLock: () => Promise<void>;
}

const NightBiteContext = createContext<NightBiteContextType | undefined>(undefined);

export function NightBiteProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => getStoredMenu());
  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [roommateTag, setRoommateTag] = useState<string>('');
  const [stockConflict, setStockConflict] = useState<StockConflictDetail | null>(null);
  const [stockFreedToast, setStockFreedToast] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [upiModalOpen, setUpiModalOpen] = useState<boolean>(false);
  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false);
  const [wakeLockSentinel, setWakeLockSentinel] = useState<WakeLockSentinel | null>(null);

  // Mess Hours & Override
  const [forceHoursOverride, setForceHoursOverride] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nightbite_hours_override') === 'true';
    }
    return false;
  });

  const [messStatus, setMessStatus] = useState<MessOperatingStatus>(() =>
    getMessOperatingStatus(forceHoursOverride)
  );

  // Sync menu & orders helper
  const reloadData = useCallback(() => {
    setMenuItems(getStoredMenu());
    setOrders(getStoredOrders());
  }, []);

  // Sync with other tabs & storage changes
  useEffect(() => {
    const unsubscribe = subscribeToSync((event) => {
      reloadData();
      if (event.type === 'NEW_ORDER_CREATED') {
        sound.playAdminNewOrder();
      } else if (event.type === 'ORDER_ACCEPTED') {
        sound.playOrderAccepted();
      } else if (event.type === 'ORDER_READY') {
        sound.playReadyForPickup();
      } else if (event.type === 'STOCK_FREED_UP') {
        const payload = event.payload as { name: string; qty: number }[] | undefined;
        if (payload && payload.length > 0) {
          const names = payload.map((p) => `${p.qty}x ${p.name}`).join(', ');
          setStockFreedToast(`Stock just freed up! ${names} returned to menu.`);
          sound.playWarning();
        }
      }
    });
    return () => unsubscribe();
  }, [reloadData]);

  // Periodic tick: updates countdown, checks auto-release ghost timer
  useEffect(() => {
    const interval = setInterval(() => {
      setMessStatus(getMessOperatingStatus(forceHoursOverride));

      // Ghost-reservation check: expires AWAITING_PAYMENT orders past deadline
      const { expiredOrders, freedItems } = checkAndExpireAwaitingPaymentOrders();
      if (expiredOrders.length > 0) {
        reloadData();
        const names = freedItems.map((p) => `${p.qty}x ${p.name}`).join(', ');
        setStockFreedToast(`Stock just freed up! ${names} returned to menu.`);
        sound.playWarning();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [forceHoursOverride, reloadData]);

  // Find active order for current student
  const activeOrder = React.useMemo(() => {
    if (!user) return null;
    return (
      orders.find(
        (o) =>
          o.studentId === user.id &&
          o.status !== 'COMPLETED' &&
          o.status !== 'EXPIRED'
      ) || null
    );
  }, [orders, user]);

  // If active order transitions to AWAITING_PAYMENT, auto open UPI Sheet
  useEffect(() => {
    if (activeOrder && activeOrder.status === 'AWAITING_PAYMENT') {
      setUpiModalOpen(true);
    }
  }, [activeOrder?.status]);

  // Cart operations
  const addToCart = (item: MenuItem) => {
    sound.playClick();
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        // Cap at live available stock
        const newQty = Math.min(existing.quantity + 1, item.availableStock);
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: newQty } : i
        );
      }
      if (item.availableStock < 1) return prev;
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          dietary: item.dietary,
        },
      ];
    });
  };

  const removeFromCart = (itemId: string) => {
    sound.playClick();
    setCart((prev) => prev.filter((i) => i.menuItemId !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    sound.playClick();
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    const menuItem = menuItems.find((m) => m.id === itemId);
    const maxStock = menuItem ? menuItem.availableStock : 99;
    const clampedQty = Math.min(quantity, maxStock);

    setCart((prev) =>
      prev.map((i) => (i.menuItemId === itemId ? { ...i, quantity: clampedQty } : i))
    );
  };

  const clearCart = () => setCart([]);

  /**
   * ATOMIC ORDER REQUEST:
   * Stock is checked and locked right now.
   * If stock has changed due to concurrent orders, throws StockConflictError.
   */
  const requestOrder = async (): Promise<Order | null> => {
    if (!user) throw new Error('Please sign in with your student email first.');
    if (cart.length === 0) throw new Error('Your cart is empty.');

    try {
      const newOrder = await createAtomicOrder({
        studentId: user.id,
        studentEmail: user.email,
        studentName: user.name,
        items: cart,
        roommateTag,
      });

      clearCart();
      setRoommateTag('');
      reloadData();
      sound.playClick();
      return newOrder;
    } catch (err: unknown) {
      if (err instanceof StockConflictError) {
        setStockConflict(err.detail);
        sound.playWarning();
        return null;
      }
      throw err;
    }
  };

  /**
   * Conflict Resolution:
   * Adjusts the cart to the remaining stock and optionally retries immediately.
   */
  const resolveConflictAndUpdateCart = async (
    itemId: string,
    availableQty: number,
    autoRetry = false
  ) => {
    setStockConflict(null);
    if (availableQty <= 0) {
      setCart((prev) => prev.filter((i) => i.menuItemId !== itemId));
    } else {
      setCart((prev) =>
        prev.map((i) =>
          i.menuItemId === itemId ? { ...i, quantity: availableQty } : i
        )
      );
    }
    reloadData();

    if (autoRetry && availableQty > 0) {
      // Delay slightly so cart state is reflected
      setTimeout(() => {
        requestOrder().catch((e) => console.warn('Retry error:', e));
      }, 50);
    }
  };

  const dismissStockConflict = () => setStockConflict(null);
  const dismissStockFreedToast = () => setStockFreedToast(null);

  // Student submits UPI UTR
  const submitUtr = async (orderId: string, utr: string) => {
    try {
      apiSubmitPayment(orderId, utr);
      reloadData();
      setUpiModalOpen(false);
      sound.playClick();
    } catch (err: unknown) {
      if (err instanceof DuplicateUtrError) {
        throw new Error(`Duplicate UTR detected: This transaction ID was already used for Order #${err.existingOrderId}. Duplicate screenshots are rejected.`);
      }
      throw err;
    }
  };

  // Admin Actions
  const adminAccept = (orderId: string) => {
    apiAdminAccept(orderId);
    reloadData();
    sound.playClick();
  };

  const adminDecline = (orderId: string, reason: string) => {
    apiAdminDecline(orderId, reason);
    reloadData();
    sound.playWarning();
  };

  const adminConfirmPayment = (orderId: string) => {
    apiConfirmPayment(orderId);
    reloadData();
    sound.playClick();
  };

  const adminMarkReady = (orderId: string) => {
    apiMarkReady(orderId);
    reloadData();
    sound.playReadyForPickup();
  };

  const adminHandover = (orderId: string, pin: string) => {
    const res = apiHandover(orderId, pin);
    if (res.success) {
      reloadData();
      sound.playOrderAccepted();
    } else {
      sound.playWarning();
    }
    return res;
  };

  const adminToggleSoldOut = (itemId: string) => {
    const menu = getStoredMenu();
    const updated = menu.map((m) =>
      m.id === itemId
        ? {
            ...m,
            isSoldOut: !m.isSoldOut,
            availableStock: !m.isSoldOut ? 0 : m.totalDailyStock || 20,
            updatedAt: Date.now(),
          }
        : m
    );
    saveStoredMenu(updated);
    reloadData();
  };

  const adminUpdateStock = (itemId: string, newStock: number) => {
    const menu = getStoredMenu();
    const updated = menu.map((m) =>
      m.id === itemId
        ? {
            ...m,
            availableStock: Math.max(0, newStock),
            isSoldOut: newStock <= 0,
            updatedAt: Date.now(),
          }
        : m
    );
    saveStoredMenu(updated);
    reloadData();
  };

  const adminAddMenuItem = (item: Omit<MenuItem, 'id' | 'updatedAt'>) => {
    const menu = getStoredMenu();
    const newItem: MenuItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      updatedAt: Date.now(),
    };
    saveStoredMenu([...menu, newItem]);
    reloadData();
  };

  const toggleMessHoursOverride = () => {
    const nextVal = !forceHoursOverride;
    setForceHoursOverride(nextVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nightbite_hours_override', String(nextVal));
    }
    setMessStatus(getMessOperatingStatus(nextVal));
  };

  // Screen Wake Lock for Admin Counter
  const toggleWakeLock = async () => {
    if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
      alert('Screen Wake Lock is not supported on this browser.');
      return;
    }

    try {
      if (wakeLockActive && wakeLockSentinel) {
        await wakeLockSentinel.release();
        setWakeLockSentinel(null);
        setWakeLockActive(false);
      } else {
        const sentinel = await navigator.wakeLock.request('screen');
        sentinel.addEventListener('release', () => {
          setWakeLockActive(false);
          setWakeLockSentinel(null);
        });
        setWakeLockSentinel(sentinel);
        setWakeLockActive(true);
      }
    } catch (err) {
      console.warn('Wake Lock error:', err);
    }
  };

  return (
    <NightBiteContext.Provider
      value={{
        menuItems,
        cart,
        roommateTag,
        activeOrder,
        orders,
        messStatus,
        stockConflict,
        stockFreedToast,
        wakeLockActive,
        selectedCategory,
        upiModalOpen,
        setSelectedCategory,
        setRoommateTag,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        requestOrder,
        resolveConflictAndUpdateCart,
        dismissStockConflict,
        dismissStockFreedToast,
        setUpiModalOpen,
        submitUtr,
        adminAccept,
        adminDecline,
        adminConfirmPayment,
        adminMarkReady,
        adminHandover,
        adminToggleSoldOut,
        adminUpdateStock,
        adminAddMenuItem,
        toggleMessHoursOverride,
        toggleWakeLock,
      }}
    >
      {children}
    </NightBiteContext.Provider>
  );
}

export function useNightBite() {
  const context = useContext(NightBiteContext);
  if (!context) {
    throw new Error('useNightBite must be used within a NightBiteProvider');
  }
  return context;
}

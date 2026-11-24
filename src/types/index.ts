export type Role = 'STUDENT' | 'ADMIN';

export type OrderStatus =
  | 'PENDING_APPROVAL'
  | 'DECLINED'
  | 'AWAITING_PAYMENT'
  | 'PAYMENT_VERIFYING'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'EXPIRED';

export type DietaryType = 'veg' | 'non-veg' | 'egg';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: 'Rolls' | 'Maggi & Noodles' | 'Snacks & Bites' | 'Beverages';
  price: number; // in INR
  availableStock: number;
  totalDailyStock: number;
  isSoldOut: boolean;
  dietary: DietaryType;
  popular?: boolean;
  badge?: string;
  updatedAt: number;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  dietary: DietaryType;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  dietary: DietaryType;
}

export interface Order {
  id: string;
  tokenNumber: number; // e.g. 14 -> #14
  pickupPin: string; // 4 digits, e.g. "8392"
  studentId: string;
  studentEmail: string;
  studentName: string;
  roomNumber?: string; // e.g. "Room 304"
  items: OrderItem[];
  totalAmount: number;
  roommateTag?: string;
  status: OrderStatus;
  declineReason?: string;
  utrNumber?: string;
  paymentDeadline?: number;
  createdAt: number;
  updatedAt: number;
  approvedAt?: number;
  paymentSubmittedAt?: number;
  paidAt?: number;
  readyAt?: number;
  completedAt?: number;
}

export interface StockConflictDetail {
  itemId: string;
  itemName: string;
  requestedQty: number;
  availableQty: number;
}

export interface MessOperatingStatus {
  isOpen: boolean;
  statusText: string;
  timeRemainingFormatted: string;
  nextEventText: string;
  isOverrideActive: boolean;
  istTimeString: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  middleName?: string;
  surname?: string;
  roomNumber?: string; // e.g. "Room 304" (Hostel block is strictly MH-4)
  role: Role;
  isDemo?: boolean;
}

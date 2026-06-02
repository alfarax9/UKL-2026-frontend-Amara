"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OrderStatus } from "@/types/api.types";

export type PaymentMethod = "cash" | "transfer" | "qris" | "venue";

export interface SavedOrderItem {
  menuId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface SavedOrder {
  id: string;
  createdAt: string;
  customerName: string;
  tableNumber: string;
  notes?: string;
  items: SavedOrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
}

interface HistoryState {
  orders: SavedOrder[];
  addOrder: (order: SavedOrder) => void;
  markPaid: (id: string) => void;
  getOrder: (id: string) => SavedOrder | undefined;
  clearOrders: () => void;
}

export const useOrderHistory = create<HistoryState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) =>
        set((s) => ({ orders: [order, ...s.orders] })),
      markPaid: (id) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, status: "PAID" } : o,
          ),
        })),
      getOrder: (id) => get().orders.find((o) => o.id === id),
      clearOrders: () => set({ orders: [] }),
    }),
    { name: "amara_order_history" },
  ),
);

/** Short, human-friendly order code derived from the API id. */
export const orderCode = (id: string) =>
  `ORD-AMR-${id.slice(-4).toUpperCase()}`;

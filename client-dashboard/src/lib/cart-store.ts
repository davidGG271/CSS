import { useSyncExternalStore } from "react";
/*import { products, type Product } from "./products";NUEVO*/
import type { Product } from "./products";

export interface CustomItem {
  name: string;
  brand: string;
  price: number;
  emoji: string;
  description: string;
  specs: { label: string; value: string }[];
}

/*export interface CartItem {
  id: string;
  qty: number;
  custom?: CustomItem;
}*/

export interface CartItem {
  id: string;
  qty: number;
  product?: Product;
  custom?: CustomItem;
}


const STORAGE_KEY = "cyc-cart";
let state: CartItem[] = [];
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = JSON.parse(raw);
  } catch { }
}

function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
}

export const cart = {
  add(product: Product, qty = 1) {
    const existing = state.find((i) => i.id === product.id);
    if (existing) {
      existing.qty += qty;
      existing.product = product;
    } else {
      state = [...state, { id: product.id, qty, product }];
    }
    persist();
  },
  addCustom(custom: CustomItem) {
    const id = `build-${Date.now()}`;
    state = [...state, { id, qty: 1, custom }];
    persist();
    return id;
  },
  remove(id: string) {
    state = state.filter((i) => i.id !== id);
    persist();
  },
  setQty(id: string, qty: number) {
    if (qty <= 0) return cart.remove(id);
    state = state.map((i) => (i.id === id ? { ...i, qty } : i));
    persist();
  },
  clear() {
    state = [];
    persist();
  },
  get items() {
    return state;
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export interface ResolvedCartItem {
  id: string;
  qty: number;
  isCustom: boolean;
  product: Product;
}

export function useCart() {
  const items = useSyncExternalStore(
    (cb) => cart.subscribe(cb),
    () => state,
    () => state
  );
  const detailed: ResolvedCartItem[] = items
    .map((i): ResolvedCartItem | null => {
      if (i.custom) {
        return {
          id: i.id,
          qty: i.qty,
          isCustom: true,
          product: {
            id: i.id,
            name: i.custom.name,
            brand: i.custom.brand,
            category: "computadoras",
            price: i.custom.price,
            rating: 5,
            stock: 1,
            description: i.custom.description,
            specs: i.custom.specs,
            emoji: i.custom.emoji,
            badge: "PC Personalizada",
          },
        };
      }
      if (i.product) {
        return { id: i.id, qty: i.qty, isCustom: false, product: i.product };
      }
      return null;
    })
    .filter((x): x is ResolvedCartItem => x !== null);

  const subtotal = detailed.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const count = detailed.reduce((sum, i) => sum + i.qty, 0);

  return { items: detailed, subtotal, count };
}

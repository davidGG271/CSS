import { useEffect, useSyncExternalStore } from "react";
import { auth, useAuth } from "./auth-store";
import {
  addCartPcArmada,
  addCartProduct,
  clearCartItems,
  getActiveCart,
  removeCartItem,
  updateCartItem,
  type CarritoBackend,
  type DetalleCarritoBackend,
  type PcArmadaBackend,
} from "./cart-api";
import { mapProducto } from "./products-api";
import type { Product } from "./products";

export interface CustomItem {
  name: string;
  brand: string;
  price: number;
  emoji: string;
  description: string;
  specs: { label: string; value: string }[];
}

export interface CartItem {
  id: string;
  qty: number;
  product?: Product;
  custom?: CustomItem;
}

export interface ResolvedCartItem {
  id: string;
  qty: number;
  isCustom: boolean;
  product: Product;
}

const STORAGE_KEY = "cyc-cart";
let state: CartItem[] = [];
let activeCartId: number | null = null;
let loadedForCliente: number | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = JSON.parse(raw);
  } catch {}
}

function notify() {
  listeners.forEach((listener) => listener());
}

function persistLocal() {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  notify();
}

function setFromBackend(carrito: CarritoBackend) {
  activeCartId = carrito.idCarrito;
  loadedForCliente = carrito.idCliente;
  state = carrito.detalles.map(mapDetalleCarrito).filter((item): item is CartItem => item !== null);
  persistLocal();
}

function mapDetalleCarrito(detalle: DetalleCarritoBackend): CartItem | null {
  if (detalle.producto) {
    return {
      id: String(detalle.idDetalleCarrito),
      qty: detalle.cantidad,
      product: mapProducto(detalle.producto),
    };
  }

  if (detalle.pcArmada) {
    return {
      id: String(detalle.idDetalleCarrito),
      qty: detalle.cantidad,
      product: mapPcArmada(detalle.pcArmada),
    };
  }

  return null;
}

function mapPcArmada(pcArmada: PcArmadaBackend): Product {
  return {
    id: `pc-${pcArmada.idPcArmada}`,
    name: pcArmada.nombre,
    brand: "CyC Custom Build",
    category: "computadoras",
    componentType: undefined,
    price: Number(pcArmada.precio),
    rating: 5,
    stock: pcArmada.stock,
    description: pcArmada.descripcion,
    specs: [],
    emoji: "PC",
    badge: "PC Armada",
  };
}

async function syncForCurrentUser() {
  const user = auth.current;
  if (!user?.idCliente) return;
  const carrito = await getActiveCart(user.idCliente);
  setFromBackend(carrito);
}

function useBackendCart() {
  return Boolean(auth.current?.idCliente);
}

function updateLocalItem(id: string, qty: number) {
  if (qty <= 0) {
    state = state.filter((item) => item.id !== id);
  } else {
    state = state.map((item) => (item.id === id ? { ...item, qty } : item));
  }
  persistLocal();
}

export const cart = {
  async loadForUser(idCliente: number) {
    if (loadedForCliente === idCliente) return;
    const carrito = await getActiveCart(idCliente);
    setFromBackend(carrito);
  },
  async refresh() {
    await syncForCurrentUser();
  },
  add(product: Product, qty = 1) {
    const user = auth.current;
    if (user?.idCliente) {
      return addCartProduct(user.idCliente, Number(product.id), qty)
        .then(setFromBackend)
        .catch((error) => console.error("No se pudo agregar al carrito", error));
    }

    const existing = state.find((item) => item.id === product.id);
    if (existing) {
      existing.qty += qty;
      existing.product = product;
    } else {
      state = [...state, { id: product.id, qty, product }];
    }
    persistLocal();
  },
  addPcArmada(idPcArmada: number, qty = 1) {
    const user = auth.current;
    if (!user?.idCliente) return;
    return addCartPcArmada(user.idCliente, idPcArmada, qty)
      .then(setFromBackend)
      .catch((error) => console.error("No se pudo agregar la PC al carrito", error));
  },
  addCustom(custom: CustomItem) {
    const id = `build-${Date.now()}`;
    state = [...state, { id, qty: 1, custom }];
    persistLocal();
    return id;
  },
  remove(id: string) {
    if (useBackendCart()) {
      void removeCartItem(Number(id))
        .then(setFromBackend)
        .catch((error) => console.error("No se pudo eliminar del carrito", error));
      return;
    }

    state = state.filter((item) => item.id !== id);
    persistLocal();
  },
  setQty(id: string, qty: number) {
    if (useBackendCart()) {
      if (qty <= 0) return cart.remove(id);
      void updateCartItem(Number(id), qty)
        .then(setFromBackend)
        .catch((error) => console.error("No se pudo actualizar el carrito", error));
      return;
    }

    updateLocalItem(id, qty);
  },
  clear() {
    if (useBackendCart() && activeCartId) {
      void clearCartItems(activeCartId)
        .then(setFromBackend)
        .catch((error) => console.error("No se pudo vaciar el carrito", error));
      return;
    }

    state = [];
    persistLocal();
  },
  clearLocal() {
    state = [];
    activeCartId = null;
    loadedForCliente = null;
    persistLocal();
  },
  get activeCartId() {
    return activeCartId;
  },
  get items() {
    return state;
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export function useCart() {
  const user = useAuth();
  const items = useSyncExternalStore(
    (callback) => cart.subscribe(callback),
    () => state,
    () => state,
  );

  useEffect(() => {
    if (!user?.idCliente) return;
    void cart.loadForUser(user.idCliente);
  }, [user?.idCliente]);

  const detailed: ResolvedCartItem[] = items
    .map((item): ResolvedCartItem | null => {
      if (item.custom) {
        return {
          id: item.id,
          qty: item.qty,
          isCustom: true,
          product: {
            id: item.id,
            name: item.custom.name,
            brand: item.custom.brand,
            category: "computadoras",
            price: item.custom.price,
            rating: 5,
            stock: 1,
            description: item.custom.description,
            specs: item.custom.specs,
            emoji: item.custom.emoji,
            badge: "PC Personalizada",
          },
        };
      }

      if (item.product) {
        return { id: item.id, qty: item.qty, isCustom: false, product: item.product };
      }

      return null;
    })
    .filter((item): item is ResolvedCartItem => item !== null);

  const subtotal = detailed.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const count = detailed.reduce((sum, item) => sum + item.qty, 0);

  return { items: detailed, subtotal, count, activeCartId };
}

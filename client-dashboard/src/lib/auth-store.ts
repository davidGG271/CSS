import { useSyncExternalStore } from "react";

export interface User {
  idCliente?: number;
  name: string;
  email: string;
  dni?: string;
  phone?: string;
  address?: string;
  city?: string;
}

const STORAGE_KEY = "cyc-user";
let state: User | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = JSON.parse(raw);
  } catch {}
}

function persist() {
  if (typeof window !== "undefined") {
    if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else localStorage.removeItem(STORAGE_KEY);
  }
  listeners.forEach((l) => l());
}

export const auth = {
  login(email: string, name = email.split("@")[0]) {
    state = { name, email };
    persist();
  },
  register(user: User) {
    state = user;
    persist();
  },
  update(patch: Partial<User>) {
    if (!state) return;
    state = { ...state, ...patch };
    persist();
  },
  logout() {
    state = null;
    persist();
  },
  get current() {
    return state;
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export function useAuth() {
  return useSyncExternalStore(
    (cb) => auth.subscribe(cb),
    () => state,
    () => state
  );
}

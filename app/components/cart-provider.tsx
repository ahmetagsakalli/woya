"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { configurationSchema, type Configuration } from "@/lib/pricing";
import { cartKey } from "@/lib/cart-key";
import { subtractPurchase } from "@/lib/payments/cart";
import type { CheckoutItem } from "@/lib/payments/schema";
export type CartProduct = {
  slug: string;
  title: string;
  image: string;
  description?: string;
  options?: string[];
  configuration?: Configuration;
};
export type CartItem = CartProduct & { quantity: number };
type CartContextValue = {
  ready: boolean;
  items: CartItem[];
  totalCount: number;
  error: string;
  accountId: string | null;
  addItem: (p: CartProduct) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, n: number) => void;
  clearCart: () => void;
  completePurchase: (reference: string, items: CheckoutItem[]) => void;
};
const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "woya-cart-v1";
const mergeKey = "woya-cart-merge-v1";
export const authChangeKey = "woya-auth-change";
export function accountChanged(url = "/profil") {
  try {
    localStorage.setItem(authChangeKey, crypto.randomUUID());
  } catch {
    /* private mode */
  }
  window.location.assign(url);
}
function readGuest(): CartItem[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(value)) return [];
    return value.slice(0, 50).flatMap((i) => {
      if (
        !i ||
        typeof i.slug !== "string" ||
        typeof i.title !== "string" ||
        typeof i.image !== "string"
      )
        return [];
      const parsed = configurationSchema.safeParse(i.configuration);
      return [
        {
          slug: i.slug,
          title: i.title,
          image: i.image,
          quantity: Math.min(
            99,
            Math.max(1, Math.round(Number(i.quantity) || 1)),
          ),
          ...(typeof i.description === "string"
            ? { description: i.description }
            : {}),
          ...(Array.isArray(i.options)
            ? {
                options: i.options.filter(
                  (s: unknown) => typeof s === "string",
                ),
              }
            : {}),
          ...(parsed.success ? { configuration: parsed.data } : {}),
        },
      ];
    });
  } catch {
    return [];
  }
}
async function api(action: string, body?: unknown) {
  const r = await fetch(`/api/hesap/${action}`, {
    method: body === undefined ? "GET" : "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Sepet eşitlenemedi.");
  return data;
}
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [accountId, setAccountId] = useState<string | null>(null);
  const state = useRef<{
    items: CartItem[];
    owner: string | null;
    version: number;
    ready: boolean;
    epoch: number;
  }>({ items: [], owner: null, version: 0, ready: false, epoch: 0 });
  const queue = useRef(Promise.resolve());
  const publish = useCallback((next: CartItem[]) => {
    state.current.items = next;
    setItems(next);
  }, []);
  useEffect(() => {
    let alive = true;
    async function load() {
      const epoch = ++state.current.epoch;
      state.current.ready = false;
      setReady(false);
      publish([]);
      try {
        const { customer } = await api("session");
        if (!alive || epoch !== state.current.epoch) return;
        state.current.owner = customer?.id || null;
        setAccountId(customer?.id || null);
        let next = readGuest();
        if (customer) {
          const mergeGuest = async () => {
            let cart = await api("cart");
            const guest = readGuest();
            if (guest.length) {
              let mergeId: string;
              try {
                mergeId = localStorage.getItem(mergeKey) || crypto.randomUUID();
                localStorage.setItem(mergeKey, mergeId);
              } catch {
                throw new Error(
                  "Misafir sepetini birleştirmek için tarayıcı depolama izni gerekiyor.",
                );
              }
              cart = await api("cart-merge", {
                owner: customer.id,
                items: guest,
                mergeId,
              });
              if (alive && epoch === state.current.epoch) {
                localStorage.removeItem(storageKey);
                localStorage.removeItem(mergeKey);
              }
            }
            return cart;
          };
          // Serialize read/merge/clear across tabs, including a second tab opened just after login.
          const cart = navigator.locks
            ? await navigator.locks.request("woya-cart-merge", mergeGuest)
            : await mergeGuest();
          next = cart.items;
          state.current.version = cart.version;
        }
        if (!alive || epoch !== state.current.epoch) return;
        publish(next);
        state.current.ready = true;
        setReady(true);
        setError("");
      } catch (e) {
        if (alive)
          setError(e instanceof Error ? e.message : "Sepet yüklenemedi.");
      }
    }
    void load();
    function onStorage(e: StorageEvent) {
      if (e.key === authChangeKey) {
        state.current.epoch++;
        state.current.ready = false;
        publish([]);
        setReady(false);
        window.location.reload();
      }
      if (e.key === storageKey && !state.current.owner && state.current.ready)
        publish(readGuest());
    }
    async function onFocus() {
      if (!state.current.ready) return;
      try {
        const data = await api("session");
        if ((data.customer?.id || null) !== state.current.owner) {
          publish([]);
          state.current.ready = false;
          setReady(false);
          window.location.reload();
        }
      } catch {
        state.current.ready = false;
        publish([]);
        setReady(false);
        setError("Oturum doğrulanamadı. Sayfayı yenileyin.");
      }
    }
    function onPageHide() {
      document.documentElement.style.visibility = "hidden";
    }
    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) window.location.reload();
      else document.documentElement.style.visibility = "";
    }
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      state.current.epoch++;
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, [publish]);
  const change = useCallback(
    (fn: (items: CartItem[]) => CartItem[]) => {
      const s = state.current;
      if (!s.ready) return;
      const next = fn(s.items);
      if (next.length > 50) {
        setError("Sepette en fazla 50 farklı seçim olabilir.");
        return;
      }
      publish(next);
      if (!s.owner) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          /* in-memory guest cart */
        }
        return;
      }
      const owner = s.owner,
        epoch = s.epoch;
      queue.current = queue.current.then(async () => {
        if (!state.current.ready || state.current.epoch !== epoch) return;
        try {
          const saved = await api("cart-save", {
            owner,
            items: next,
            version: state.current.version,
          });
          if (state.current.epoch === epoch)
            state.current.version = saved.version;
        } catch (e) {
          state.current.ready = false;
          setReady(false);
          setError(
            (e instanceof Error ? e.message : "Sepet kaydedilemedi.") +
              " Sayfayı yenileyerek güncel sepeti yükleyin.",
          );
        }
      });
    },
    [publish],
  );
  const addItem = useCallback(
    (product: CartProduct) =>
      change((current) => {
        const found = current.some((i) => cartKey(i) === cartKey(product));
        return found
          ? current.map((i) =>
              cartKey(i) === cartKey(product)
                ? { ...i, ...product, quantity: Math.min(99, i.quantity + 1) }
                : i,
            )
          : [...current, { ...product, quantity: 1 }];
      }),
    [change],
  );
  const removeItem = useCallback(
    (key: string) =>
      change((current) => current.filter((i) => cartKey(i) !== key)),
    [change],
  );
  const updateQuantity = useCallback(
    (key: string, n: number) =>
      change((current) =>
        current.map((i) =>
          cartKey(i) === key
            ? { ...i, quantity: Math.min(99, Math.max(1, Math.round(n) || 1)) }
            : i,
        ),
      ),
    [change],
  );
  const clearCart = useCallback(() => change(() => []), [change]);
  const purchased = useRef(new Set<string>());
  const completePurchase = useCallback(
    (reference: string, purchase: CheckoutItem[]) => {
      if (purchased.current.has(reference)) return;
      purchased.current.add(reference);
      if (state.current.owner) {
        const epoch = state.current.epoch;
        queue.current = queue.current.then(async () => {
          try {
            const cart = await api("cart");
            if (state.current.epoch === epoch) {
              state.current.version = cart.version;
              publish(cart.items);
            }
          } catch {
            purchased.current.delete(reference);
          }
        });
        return;
      }
      try {
        const key = `woya-purchased:${reference}`;
        if (localStorage.getItem(key)) return;
        localStorage.setItem(key, "1");
        change((current) => subtractPurchase(current, purchase));
      } catch {
        /* Never subtract twice without durable marker. */
      }
    },
    [change, publish],
  );
  const value = useMemo(
    () => ({
      ready,
      items,
      totalCount: items.reduce((n, i) => n + i.quantity, 0),
      error,
      accountId,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      completePurchase,
    }),
    [
      ready,
      items,
      error,
      accountId,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      completePurchase,
    ],
  );
  return (
    <CartContext.Provider value={value}>
      {children}
      {error && (
        <div className="cart-sync-error" role="alert">
          {error}{" "}
          <button onClick={() => window.location.reload()}>
            Yeniden yükle
          </button>
        </div>
      )}
    </CartContext.Provider>
  );
}
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

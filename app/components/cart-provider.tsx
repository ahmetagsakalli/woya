"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { configurationSchema, type Configuration } from "@/lib/pricing";
import { cartKey } from "@/lib/cart-key";

export type CartProduct = {
  slug: string;
  title: string;
  image: string;
  description?: string;
  options?: string[];
  configuration?: Configuration;
};

export type CartItem = CartProduct & {
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalCount: number;
  addItem: (product: CartProduct) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
};

const cartStorageKey = "woya-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

function clampQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return Math.max(1, Math.min(99, Math.round(quantity)));
}

function sanitizeItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const candidate = item as Partial<CartItem>;

    if (
      !item ||
      typeof item !== "object" ||
      typeof candidate.slug !== "string" ||
      typeof candidate.title !== "string" ||
      typeof candidate.image !== "string"
    ) {
      return [];
    }

    return [
      {
        slug: candidate.slug,
        title: candidate.title,
        image: candidate.image,
        description:
          typeof candidate.description === "string"
            ? candidate.description
            : undefined,
        options: Array.isArray(candidate.options)
          ? candidate.options.filter(
              (option): option is string => typeof option === "string",
            )
          : undefined,
        quantity: clampQuantity(
          typeof candidate.quantity === "number" ? candidate.quantity : 1,
        ),
        configuration: configurationSchema.safeParse(candidate.configuration)
          .success
          ? configurationSchema.parse(candidate.configuration)
          : undefined,
      },
    ];
  });
}

function readCartStorage() {
  try {
    return sanitizeItems(
      JSON.parse(window.localStorage.getItem(cartStorageKey) ?? "[]"),
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  useEffect(() => {
    setItems(readCartStorage());
    setHasLoadedStorage(true);

    function handleStorage(event: StorageEvent) {
      if (event.key === cartStorageKey) {
        setItems(readCartStorage());
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    try {
      window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
    } catch {
      /* Keep the in-memory cart usable when storage is unavailable. */
    }
  }, [hasLoadedStorage, items]);

  const addItem = useCallback((product: CartProduct) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => cartKey(item) === cartKey(product),
      );

      if (existingItem) {
        return currentItems.map((item) =>
          cartKey(item) === cartKey(product)
            ? {
                ...item,
                ...product,
                quantity: clampQuantity(item.quantity + 1),
              }
            : item,
        );
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((slug: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => cartKey(item) !== slug),
    );
  }, []);

  const updateQuantity = useCallback((slug: string, quantity: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        cartKey(item) === slug
          ? { ...item, quantity: clampQuantity(quantity) }
          : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      totalCount,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [addItem, clearCart, items, removeItem, totalCount, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}

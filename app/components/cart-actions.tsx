"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useCart, type CartProduct } from "./cart-provider";
import { cartKey } from "@/lib/cart-key";
import styles from "./measurement-controls.module.css";

type AddToCartButtonProps = {
  product: CartProduct;
  className: string;
  children?: ReactNode;
  iconSize?: number;
  disabled?: boolean;
};

export function AddToCartButton({
  product,
  className,
  children = "Sepete Ekle",
  iconSize = 16,
  disabled = false,
}: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [wasAdded, setWasAdded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!wasAdded) {
      return;
    }

    const timeoutId = window.setTimeout(() => setWasAdded(false), 1200);
    return () => window.clearTimeout(timeoutId);
  }, [wasAdded]);

  return (
    <>
      <button
        className={`${className} ${styles.purchase}`}
        type="button"
        disabled={disabled || busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const existing = items.find(
              (item) => cartKey(item) === cartKey(product),
            );
            if (!existing && items.length >= 50)
              throw new Error("Sepete en fazla 50 farklı seçim eklenebilir.");
            if (existing && existing.quantity >= 99)
              throw new Error("Bu seçimden en fazla 99 adet eklenebilir.");
            const response = await fetch("/api/sepet/fiyat", {
              method: "POST",
              signal: AbortSignal.timeout(15000),
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: [
                  {
                    slug: product.slug,
                    configuration: product.configuration,
                    quantity: (existing?.quantity ?? 0) + 1,
                  },
                ],
              }),
            });
            const data = await response.json();
            const quote = data.quotes?.[0];
            if (!response.ok || quote?.price == null)
              throw new Error(
                quote?.error || data.error || "Fiyat doğrulanamadı.",
              );
            addItem({ ...product, options: quote.options });
            setWasAdded(true);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Sepete eklenemedi.");
          } finally {
            setBusy(false);
          }
        }}
        aria-label={`${product.title} sepete ekle`}
        aria-live="polite"
      >
        <span>
          {busy ? "Kontrol ediliyor…" : wasAdded ? "Sepete Eklendi" : children}
        </span>
        <ShoppingCart aria-hidden="true" size={iconSize} />
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}

export function CartIconLink({
  className,
  labelMode = "hidden",
}: {
  className: string;
  labelMode?: "hidden" | "visible";
}) {
  const { totalCount } = useCart();
  const badgeText = totalCount > 99 ? "99+" : String(totalCount);

  return (
    <Link
      className={`${className} cart-link`}
      href="/sepet"
      aria-label={totalCount > 0 ? `Sepet, ${totalCount} ürün` : "Sepet"}
    >
      <ShoppingCart aria-hidden="true" size={22} strokeWidth={2.5} />
      <span className={labelMode === "visible" ? undefined : "sr-only"}>
        Sepet
      </span>
      {totalCount > 0 ? <span className="cart-badge">{badgeText}</span> : null}
    </Link>
  );
}

export function FloatingCartLink() {
  const { totalCount } = useCart();
  const [isPastHero, setIsPastHero] = useState(false);
  const badgeText = totalCount > 99 ? "99+" : String(totalCount);

  useEffect(() => {
    let frameId = 0;

    function updateVisibility() {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const hero = document.querySelector<HTMLElement>(
          ".commerce-hero, .subpage-hero",
        );
        setIsPastHero(
          hero
            ? hero.getBoundingClientRect().bottom <= 80
            : window.scrollY > 220,
        );
      });
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  if (!isPastHero) {
    return null;
  }

  return (
    <Link
      className="floating-cart-link cart-link"
      href="/sepet"
      aria-label={totalCount > 0 ? `Sepet, ${totalCount} ürün` : "Sepet"}
    >
      <ShoppingCart aria-hidden="true" size={23} strokeWidth={2.5} />
      <span className="sr-only">Sepet</span>
      {totalCount > 0 ? <span className="cart-badge">{badgeText}</span> : null}
    </Link>
  );
}

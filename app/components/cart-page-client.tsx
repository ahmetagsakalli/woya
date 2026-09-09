"use client";

import Image from "next/image";
import { ClockArtwork } from "./clock-artwork";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cartKey } from "@/lib/cart-key";
import type { PriceQuote } from "@/lib/quote";
import {
  ArrowUpRight,
  CreditCard,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useCart } from "./cart-provider";

const currency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

export function CartPageClient({
  paymentsEnabled = false,
}: {
  paymentsEnabled?: boolean;
}) {
  const { clearCart, items, removeItem, totalCount, updateQuantity } =
    useCart();
  const requestKey = JSON.stringify(
    items.map(({ slug, configuration, quantity }) => ({
      slug,
      configuration,
      quantity,
    })),
  );
  const [snapshot, setSnapshot] = useState<{
    key: string;
    quotes: PriceQuote[];
  }>();
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    if (requestKey === "[]") return;
    let inFlight = false;
    async function refresh() {
      if (inFlight) return;
      inFlight = true;
      setLoading(true);
      try {
        const response = await fetch("/api/sepet/fiyat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: `{"items":${requestKey}}`,
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Fiyatlar güncellenemedi.");
        if (!controller.signal.aborted) {
          setSnapshot({ key: requestKey, quotes: data.quotes });
          setError("");
        }
      } catch (e) {
        if (!controller.signal.aborted) {
          setSnapshot(undefined);
          setError(e instanceof Error ? e.message : "Fiyatlar güncellenemedi.");
        }
      } finally {
        inFlight = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void refresh();
    const focus = () => {
      if (!document.hidden) void refresh();
    };
    window.addEventListener("focus", focus);
    const interval = window.setInterval(focus, 30000);
    return () => {
      controller.abort();
      window.removeEventListener("focus", focus);
      window.clearInterval(interval);
    };
  }, [requestKey, retry]);
  const quotes = snapshot?.key === requestKey ? snapshot.quotes : [];
  const allPriced =
    !error &&
    quotes.length === items.length &&
    quotes.every((q) => q.price !== null);
  const subtotal = allPriced
    ? items.reduce(
        (sum, item, index) => sum + quotes[index].price! * item.quantity,
        0,
      )
    : null;

  if (!items.length) {
    return (
      <section className="utility-page-section cart-page-section">
        <div className="utility-panel">
          <ShoppingCart aria-hidden="true" size={30} />
          <h2>Sepetiniz şimdilik boş.</h2>
          <div className="utility-actions">
            <Link className="product-detail-primary" href="/urunler">
              Tüm ürünleri incele
              <ArrowUpRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="utility-page-section cart-page-section"
      aria-label="Sepetinizdeki ürünler"
    >
      <div className="cart-page-layout">
        <div className="cart-list-panel">
          <div className="cart-list-head">
            <div>
              <span>Sepetiniz</span>
              <h2>{totalCount} ürün seçildi</h2>
            </div>
            <button
              className="cart-clear-button"
              type="button"
              onClick={clearCart}
            >
              Sepeti boşalt
            </button>
          </div>

          <div className="cart-items-list">
            {items.map((item, index) => (
              <article className="cart-item" key={cartKey(item)}>
                <div className="cart-item-image">
                  {item.configuration?.source === "builder" ? (
                    <ClockArtwork
                      code={item.configuration.clock}
                      style={item.configuration.numeral}
                      source={
                        item.configuration.numeral === "original"
                          ? item.image
                          : undefined
                      }
                      sizes="96px"
                    />
                  ) : (
                    <Image src={item.image} alt="" fill sizes="96px" />
                  )}
                </div>

                <div className="cart-item-copy">
                  <h3>{item.title}</h3>
                  <p className="cart-item-price">
                    {quotes[index]?.price != null
                      ? currency.format(quotes[index].price!)
                      : quotes[index]?.error ||
                        (error ? "Fiyat doğrulanamadı" : "Fiyat hesaplanıyor…")}
                  </p>
                  {quotes[index]?.price === null && (
                    <Link
                      href={
                        item.slug.startsWith("ozel-")
                          ? "/#kendi-tasariminiz"
                          : `/urunler/${encodeURIComponent(item.slug)}#urun-olculeri`
                      }
                    >
                      Ölçü ve ürün seçimini düzenle
                    </Link>
                  )}
                  {item.description ? <p>{item.description}</p> : null}
                  {quotes[index]?.options.length || item.options?.length ? (
                    <ul>
                      {(quotes[index]?.options.length
                        ? quotes[index].options
                        : (item.options ?? [])
                      ).map((option) => (
                        <li key={option}>{option}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div
                  className="cart-item-controls"
                  aria-label={`${item.title} adet kontrolü`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(cartKey(item), item.quantity - 1)
                    }
                    aria-label={`${item.title} adedini azalt`}
                  >
                    <Minus aria-hidden="true" size={16} />
                  </button>
                  <strong>{item.quantity}</strong>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(cartKey(item), item.quantity + 1)
                    }
                    aria-label={`${item.title} adedini artır`}
                  >
                    <Plus aria-hidden="true" size={16} />
                  </button>
                </div>

                <button
                  className="cart-remove-button"
                  type="button"
                  onClick={() => removeItem(cartKey(item))}
                  aria-label={`${item.title} sepetten kaldır`}
                >
                  <Trash2 aria-hidden="true" size={17} />
                </button>
              </article>
            ))}
          </div>
        </div>

        <aside
          className="cart-summary-panel"
          aria-labelledby="cart-summary-title"
        >
          <h2 id="cart-summary-title">Sipariş Özeti</h2>
          {loading && <p role="status">Fiyatlar güncelleniyor…</p>}
          {error && (
            <div role="alert">
              <p>{error}</p>
              <button type="button" onClick={() => setRetry((n) => n + 1)}>
                Tekrar dene
              </button>
            </div>
          )}
          <div className="cart-summary-row">
            <span>Ürün adedi</span>
            <strong>{totalCount}</strong>
          </div>
          <div className="cart-summary-row">
            <span>Ara toplam</span>
            <strong>
              {subtotal !== null ? currency.format(subtotal) : "Hesaplanamıyor"}
            </strong>
          </div>
          {paymentsEnabled && allPriced ? (
            <Link className="product-detail-primary" href="/odeme">
              Ödemeye geç <CreditCard aria-hidden="true" size={18} />
            </Link>
          ) : (
            <>
              <p id="checkout-unavailable">
                {paymentsEnabled
                  ? "Devam etmek için ürün ve fiyat bilgilerini kontrol edin."
                  : "Online ödeme henüz kullanıma açılmadı."}
              </p>
              <button
                className="product-detail-primary"
                type="button"
                disabled
                aria-describedby="checkout-unavailable"
              >
                Ödemeye geç
                <CreditCard aria-hidden="true" size={18} />
              </button>
            </>
          )}
          <Link className="product-detail-secondary" href="/urunler">
            Alışverişe devam et
          </Link>
        </aside>
      </div>
    </section>
  );
}

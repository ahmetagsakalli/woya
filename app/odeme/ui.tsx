"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, LoaderCircle } from "lucide-react";
import { useCart } from "../components/cart-provider";
import type { CheckoutQuote } from "@/lib/payments/schema";
import { customerSchema } from "@/lib/payments/schema";
import styles from "./payment.module.css";

export const money = (kurus: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
    kurus / 100,
  );
type Summary = {
  quote: CheckoutQuote;
  testMode: boolean;
  terms: string;
  information: string;
};

export function CheckoutForm({ enabled }: { enabled: boolean }) {
  const { items, ready } = useCart();
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<{
    selection: string;
    data: Summary;
  }>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const inFlight = useRef(false);
  const requestId = useRef("");
  const selection = JSON.stringify(
    items.map(({ slug, quantity, configuration }) => ({
      slug,
      quantity,
      configuration,
    })),
  );
  const summary = snapshot?.selection === selection ? snapshot.data : undefined;
  useEffect(() => {
    if (!enabled || !ready || selection === "[]") return;
    const controller = new AbortController();
    setSnapshot(undefined);
    setError("");
    requestId.current = crypto.randomUUID();
    void fetch("/api/odeme/ozet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: `{"items":${selection}}`,
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Sipariş özeti alınamadı.");
        if (!controller.signal.aborted) setSnapshot({ selection, data });
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : "Bağlantı kurulamadı.");
      });
    return () => controller.abort();
  }, [enabled, ready, selection, retry]);

  if (!enabled || (ready && !items.length))
    return (
      <section className={styles.section}>
        <h2>
          {enabled ? "Sepetiniz boş" : "Online ödeme henüz kullanıma açılmadı"}
        </h2>
        <Link href="/sepet" className="product-detail-secondary">
          <ArrowLeft size={18} /> Sepete dön
        </Link>
      </section>
    );
  if (!ready)
    return (
      <section className={styles.section} role="status">
        Sepetiniz yükleniyor...
      </section>
    );

  return (
    <section className={styles.section}>
      <Link href="/sepet" className={styles.back}>
        <ArrowLeft size={16} /> Sepeti düzenle
      </Link>
      {summary?.testMode && (
        <p className={styles.notice}>
          Test modu: Bu işlem gerçek bir satın alma değildir.
        </p>
      )}
      <div className={styles.layout}>
        <form
          className={styles.form}
          onSubmit={async (event) => {
            event.preventDefault();
            if (!summary || inFlight.current) return;
            const data = new FormData(event.currentTarget);
            const customer = customerSchema.safeParse(
              Object.fromEntries(
                ["name", "email", "phone", "address"].map((key) => [
                  key,
                  data.get(key),
                ]),
              ),
            );
            if (!customer.success) {
              setError(customer.error.issues.map((i) => i.message).join(" "));
              return;
            }
            inFlight.current = true;
            setBusy(true);
            setError("");
            try {
              const response = await fetch("/api/odeme/baslat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  requestId: requestId.current,
                  quoteHash: summary.quote.hash,
                  items: JSON.parse(selection),
                  customer: customer.data,
                  note: data.get("note"),
                  consent: data.get("consent") === "on",
                }),
              });
              const result = await response.json();
              if (!response.ok)
                throw new Error(result.error || "Ödeme başlatılamadı.");
              router.push(result.url);
            } catch (e) {
              setError(
                e instanceof Error
                  ? e.message
                  : "Bağlantı kurulamadı. Tekrar deneyin.",
              );
            } finally {
              inFlight.current = false;
              setBusy(false);
            }
          }}
        >
          <h2>Teslimat bilgileri</h2>
          <fieldset disabled={busy}>
            <label>
              Ad soyad
              <input
                name="name"
                autoComplete="name"
                required
                minLength={3}
                maxLength={60}
              />
            </label>
            <div className={styles.fields}>
              <label>
                E-posta
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={100}
                />
              </label>
              <label>
                Telefon
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  minLength={10}
                  maxLength={20}
                />
              </label>
            </div>
            <label>
              Açık adres
              <textarea
                name="address"
                autoComplete="street-address"
                required
                minLength={15}
                maxLength={400}
                rows={4}
                placeholder="İl, ilçe, mahalle, cadde ve kapı numarası"
              />
            </label>
            <label>
              Sipariş notu (isteğe bağlı)
              <textarea name="note" maxLength={1000} rows={2} />
            </label>
            <label className={styles.consent}>
              <input type="checkbox" name="consent" required />
              <span>
                {summary?.terms && summary.information ? (
                  <>
                    <Link target="_blank" href={summary.information}>
                      Ön bilgilendirme formunu
                    </Link>{" "}
                    ve{" "}
                    <Link target="_blank" href={summary.terms}>
                      mesafeli satış sözleşmesini
                    </Link>{" "}
                    okudum, kabul ediyorum.
                  </>
                ) : (
                  "Sipariş ve teslimat bilgilerimi onaylıyorum."
                )}
              </span>
            </label>
          </fieldset>
          {error && (
            <div role="alert" className={styles.error}>
              <p>{error}</p>
              <button
                type="button"
                disabled={busy}
                onClick={() => setRetry((n) => n + 1)}
              >
                Sipariş özetini yenile
              </button>
            </div>
          )}
          <button
            type="submit"
            disabled={busy || !summary}
            className="product-detail-primary"
          >
            {busy ? (
              <LoaderCircle size={18} className={styles.spinner} />
            ) : (
              <CreditCard size={18} />
            )}
            {busy
              ? "Ödeme hazırlanıyor"
              : summary
                ? `${money(summary.quote.total)} öde`
                : "Tutar hesaplanıyor"}
          </button>
        </form>
        <aside className={styles.summary} aria-labelledby="checkout-summary">
          <h2 id="checkout-summary">Sipariş özeti</h2>
          {!summary ? (
            <p role="status">
              {error
                ? "Özet alınamadı."
                : "Güncel fiyatlar kontrol ediliyor..."}
            </p>
          ) : (
            <>
              <ul className={styles.items}>
                {summary.quote.items.map((line, i) => (
                  <li key={i}>
                    <div className={styles.image}>
                      <Image src={items[i].image} alt="" fill sizes="64px" />
                    </div>
                    <div>
                      <strong>{line.title}</strong>
                      <small>{line.quantity} adet</small>
                      {line.options.map((o, n) => (
                        <small key={n}>{o}</small>
                      ))}
                    </div>
                    <strong>
                      {money(Math.round(line.unitPrice * 100) * line.quantity)}
                    </strong>
                  </li>
                ))}
              </ul>
              <dl className={styles.totals}>
                <div>
                  <dt>Ara toplam</dt>
                  <dd>{money(summary.quote.subtotal)}</dd>
                </div>
                <div>
                  <dt>Kargo</dt>
                  <dd>
                    {summary.quote.shipping
                      ? money(summary.quote.shipping)
                      : "Ücretsiz"}
                  </dd>
                </div>
                <div>
                  <dt>Toplam</dt>
                  <dd>{money(summary.quote.total)}</dd>
                </div>
              </dl>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}

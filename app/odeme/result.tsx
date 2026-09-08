"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { CircleCheck, Clock3, CircleAlert } from "lucide-react";
import { useCart } from "../components/cart-provider";
import type {
  CheckoutQuote,
  CheckoutInput,
  PaymentSummary,
} from "@/lib/payments/schema";
import { paymentLabels } from "@/lib/payments/schema";
import { money } from "./ui";
import styles from "./payment.module.css";

type Result = {
  reference: string;
  payment: PaymentSummary;
  iframeUrl: string | null;
  items: CheckoutQuote["items"];
  customer: CheckoutInput["customer"];
};
type ResizableFrame = HTMLIFrameElement & {
  iFrameResizer?: { removeListeners: () => void };
};
function PaytrFrame({ src }: { src: string }) {
  const frame = useRef<ResizableFrame>(null);
  useEffect(() => {
    const element = frame.current;
    return () => element?.iFrameResizer?.removeListeners();
  }, []);
  return (
    <>
      <iframe
        ref={frame}
        id="paytriframe"
        title="PayTR güvenli kart ödeme formu"
        src={src}
        className={styles.frame}
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <Script
        src="https://www.paytr.com/js/iframeResizer.min.js"
        strategy="afterInteractive"
        onReady={() => {
          const api = window as typeof window & {
            iFrameResize?: (
              options: { checkOrigin: string[] },
              frame: HTMLIFrameElement,
            ) => void;
          };
          if (frame.current && !frame.current.iFrameResizer)
            api.iFrameResize?.(
              { checkOrigin: ["https://www.paytr.com"] },
              frame.current,
            );
        }}
      />
    </>
  );
}
export function PaymentView({
  oid,
  showFrame = false,
}: {
  oid: string;
  showFrame?: boolean;
}) {
  const [result, setResult] = useState<Result>();
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const { ready, completePurchase } = useCart();
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let count = 0;
    setError("");
    setWaiting(false);
    async function poll() {
      try {
        const response = await fetch(
          `/api/odeme/durum?order=${encodeURIComponent(oid)}`,
          { cache: "no-store", signal: controller.signal },
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Ödeme durumu alınamadı.");
        if (controller.signal.aborted) return;
        setResult(data);
        if (["creating", "ready", "pending"].includes(data.payment.state)) {
          if (++count < 30) timer = setTimeout(poll, showFrame ? 10000 : 4000);
          else setWaiting(true);
        }
      } catch (e) {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : "Bağlantı kurulamadı.");
      }
    }
    void poll();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [oid, retry, showFrame]);
  useEffect(() => {
    if (ready && result?.payment.state === "paid" && !result.payment.testMode)
      completePurchase(result.reference, result.items);
  }, [ready, result, completePurchase]);
  const paid = result?.payment.state === "paid";
  const unsuccessful =
    result && ["failed", "token_failed"].includes(result.payment.state);
  const review = result?.payment.state === "review";
  return (
    <section className={styles.section}>
      {result?.payment.testMode && (
        <p className={styles.notice}>
          Test işlemi. Gerçek sipariş olarak hazırlanmaz ve gönderilmez.
        </p>
      )}
      {showFrame && result?.iframeUrl && (
        <>
          <p className={styles.reference}>
            Sipariş: {result.reference} · {money(result.payment.amount)}
          </p>
          <details className={styles.receipt} open>
            <summary>Sipariş özeti</summary>
            <ul>
              {result.items.map((item, i) => (
                <li key={i}>
                  <strong>
                    {item.title} · {item.quantity} adet
                  </strong>
                  <span>
                    {money(Math.round(item.unitPrice * 100) * item.quantity)}
                  </span>
                  <small>{item.options.join(" · ")}</small>
                </li>
              ))}
            </ul>
            <p>
              Kargo:{" "}
              {result.payment.shipping
                ? money(result.payment.shipping)
                : "Ücretsiz"}
            </p>
            <p>
              <strong>{result.customer.name}</strong>
              <br />
              {result.customer.address}
            </p>
          </details>
          <PaytrFrame src={result.iframeUrl} />
        </>
      )}
      {(!showFrame || !result?.iframeUrl) && (
        <div className={styles.result} aria-live="polite">
          {paid ? (
            <CircleCheck size={36} />
          ) : unsuccessful || review ? (
            <CircleAlert size={36} />
          ) : (
            <Clock3 size={36} />
          )}
          <h2>
            {error
              ? "Ödeme durumu görüntülenemedi"
              : !result
                ? "Ödeme durumu kontrol ediliyor"
                : paid && result.payment.testMode
                  ? "Test ödemesi tamamlandı"
                  : paid
                    ? "Ödemeniz alındı"
                    : paymentLabels[result.payment.state]}
          </h2>
          {result && (
            <p className={styles.reference}>
              Sipariş: {result.reference}
              <br />
              Toplam: {money(result.payment.amount)}
            </p>
          )}
          <p>
            {error ||
              (paid
                ? result?.payment.testMode
                  ? "Bu işlem için ürün gönderimi yapılmayacak."
                  : "Siparişiniz kaydedildi. Sipariş numaranızla bizimle iletişime geçebilirsiniz."
                : unsuccessful
                  ? "Ödeme tamamlanmadı. Sepetinize dönüp yeniden deneyebilirsiniz."
                  : review
                    ? "Ödeme sonucu kontrol ediliyor. Yeniden ödeme yapmadan önce sipariş numaranızla bize ulaşın."
                    : "PayTR'nin kesin sonucu bekleniyor. Tekrar ödeme yapmayın; sonucu bu sayfadan kontrol edebilirsiniz.")}
          </p>
          {result?.iframeUrl && !showFrame && (
            <Link
              className="product-detail-primary"
              href={`/odeme/islem/${oid}`}
            >
              Ödeme ekranına dön
            </Link>
          )}
          {(error || waiting || review) && (
            <button
              className="product-detail-secondary"
              onClick={() => setRetry((n) => n + 1)}
            >
              Durumu yeniden kontrol et
            </button>
          )}
          <Link
            className="product-detail-secondary"
            href={paid ? "/urunler" : unsuccessful ? "/sepet" : "/iletisim"}
          >
            {paid
              ? "Alışverişe devam et"
              : unsuccessful
                ? "Sepete dön"
                : "Bize ulaşın"}
          </Link>
        </div>
      )}
      {showFrame && result?.iframeUrl && (waiting || error) && (
        <p className={styles.notice}>
          {error || "Ödeme sonucunuzu kontrol edebilirsiniz."}{" "}
          <Link href={`/odeme/sonuc?order=${oid}`}>
            Ödeme durumunu görüntüle
          </Link>
        </p>
      )}
    </section>
  );
}

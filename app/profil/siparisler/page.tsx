import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { pageSession } from "@/lib/customer/auth";
import { listOrders } from "@/lib/customer/orders";
import { statusLabels, type Order } from "@/lib/admin/schema";
import { paymentLabels } from "@/lib/payments/schema";
import styles from "../account.module.css";
export const metadata = { title: "Siparişlerim" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if (!(await pageSession())) redirect("/profil");
  const q = await searchParams;
  const page = z.coerce
    .number()
    .int()
    .min(1)
    .max(100000)
    .catch(1)
    .parse(q.page);
  const data = await listOrders(page);
  return (
    <>
      <h1>Siparişlerim</h1>
      {!data.orders.length ? (
        <p className={styles.empty}>
          Hesabınıza bağlı sipariş yok. Eski misafir siparişiniz için{" "}
          <Link href="/profil/misafir">güvenli erişim bağlantısı isteyin</Link>.
        </p>
      ) : (
        <ul className={styles.list}>
          {data.orders.map((o) => (
            <li key={o.reference}>
              <div className={styles.row}>
                <Link
                  className={styles.reference}
                  href={`/profil/siparisler/${o.reference}`}
                >
                  {o.reference}
                </Link>
                <span>
                  {new Date(o.created_at).toLocaleString("tr-TR", {
                    timeZone: "Europe/Istanbul",
                  })}
                </span>
              </div>
              <p>
                {statusLabels[o.status as Order["status"]]} ·{" "}
                {o.payment
                  ? `${o.payment.testMode ? "TEST · " : ""}${paymentLabels[o.payment.state as keyof typeof paymentLabels]}`
                  : "Çevrimiçi ödeme yok"}
              </p>
              <p>
                {o.items
                  .map(
                    (i: { title: string; quantity: number }) =>
                      `${i.title} (${i.quantity})`,
                  )
                  .join(" · ")}
              </p>
              {o.payment && (
                <p>
                  {new Intl.NumberFormat("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                  }).format(o.payment.amount / 100)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className={styles.links}>
        {page > 1 && (
          <Link href={`/profil/siparisler?page=${page - 1}`}>Önceki</Link>
        )}
        {data.hasNext && (
          <Link href={`/profil/siparisler?page=${page + 1}`}>Sonraki</Link>
        )}
      </div>
    </>
  );
}

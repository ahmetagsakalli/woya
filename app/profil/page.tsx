import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, UserRound } from "lucide-react";
import { PageShell } from "../components/page-shell";

export const metadata: Metadata = {
  title: "Hesap",
  description: "WOYA hesap ve sipariş takip giriş sayfası.",
  alternates: { canonical: "/profil" },
};

export default function ProfilePage() {
  return (
    <PageShell
      title="Siparişlerinizi takip edin."
      text="Hesap alanı, sipariş takibi ve iletişim süreci için hazırlanmıştır."
    >
      <section className="utility-page-section">
        <div className="utility-panel">
          <UserRound aria-hidden="true" size={30} />
          <h2>Hesap girişi yakında aktif olacak.</h2>
          <p>
            Şimdilik sipariş ve ürün bilgileri için telefon, WhatsApp veya Instagram üzerinden
            WOYA ile iletişime geçebilirsiniz.
          </p>
          <div className="utility-actions">
            <Link className="product-detail-primary" href="/iletisim">
              İletişime geç
              <ArrowUpRight aria-hidden="true" size={18} />
            </Link>
            <Link className="product-detail-secondary" href="/urunler">
              Ürünleri incele
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

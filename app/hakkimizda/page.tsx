import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "../components/page-shell";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "WOYA'nın tablo, saat ve dekoratif duvar ürünü seçimine yaklaşımını inceleyin.",
  alternates: { canonical: "/hakkimizda" },
};

const principles = [
  "Duvar ölçüsü, ışık ve mobilya dili birlikte değerlendirilir.",
  "Ürün seçimi yalnızca desenle değil, mekandaki ağırlığıyla ele alınır.",
  "Sipariş öncesi parça dizilimi ve görsel uyum netleştirilir.",
];

export default function AboutPage() {
  return (
    <PageShell
      title="WOYA ile duvar dekorasyonunu daha net seçin."
      text="Tablo ve saatleri yalnızca tekil ürün olarak değil, yaşam alanının tamamlayıcı odağı olarak ele alıyoruz."
    >
      <section className="brand-page-section">
        <div className="brand-page-copy">
          <h2>Mekanla uyumlu, dengeli ve kalıcı bir dekor dili.</h2>
          <p>
            WOYA koleksiyonunda cam tablo, dekoratif saat ve set ürünleri; renk, ölçü,
            ışık ve mobilya dengesiyle birlikte değerlendirilir. Amaç, duvarda yalnızca
            doluluk oluşturmak değil; alana karakter katan net bir odak hazırlamaktır.
          </p>
          <Link className="product-detail-primary" href="/koleksiyon">
            Koleksiyonu İncele
            <ArrowUpRight aria-hidden="true" size={18} />
          </Link>
        </div>
        <div className="brand-principles">
          {principles.map((principle, index) => (
            <article key={principle}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{principle}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

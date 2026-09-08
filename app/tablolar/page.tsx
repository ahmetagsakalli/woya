import type { Metadata } from "next";
import { CatalogPageContent } from "../components/catalog-page-content";
import { PageShell } from "../components/page-shell";
import { storefrontProducts } from "@/lib/storefront";

export const metadata: Metadata = {
  title: "Tablolar",
  description:
    "WOYA tablo ve tablo-saat setlerini modern, çiçekli, botanik ve aynalı seçeneklerle keşfedin.",
  alternates: { canonical: "/tablolar" },
};

export default async function TablesPage() {
  const tableProducts = await storefrontProducts("tablolar");
  return (
    <PageShell
      title="Tablo ve Setler"
      text="Yan paneller, saat merkezi ve duvar oranı birlikte değerlendirilerek dengeli bir görünüm hazırlanır."
    >
      <CatalogPageContent
        products={tableProducts}
        active="Tablolar"
        note="Tablo setlerinde renk tonu, mobilya dili ve duvar genişliği sipariş öncesi birlikte kontrol edilir."
      />
    </PageShell>
  );
}

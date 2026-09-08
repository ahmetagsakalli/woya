import type { Metadata } from "next";
import { CatalogPageContent } from "../components/catalog-page-content";
import { PageShell } from "../components/page-shell";
import { storefrontProducts } from "@/lib/storefront";

export const metadata: Metadata = {
  title: "Tüm Ürünler",
  description:
    "WOYA tablo, saat, aynalı set ve dekoratif duvar ürünlerini tek katalogda inceleyin.",
  alternates: { canonical: "/urunler" },
};

export default async function ProductsPage() {
  const woyaProducts = await storefrontProducts();
  return (
    <PageShell
      title="Tüm Ürünler"
      text="Tablo ve saat setleri, dekoratif saatler ve aynalı kompozisyonlar arasından yaşam alanınıza uygun parçayı seçin."
    >
      <CatalogPageContent
        products={woyaProducts}
        active="Tüm Ürünler"
        note="Ürünler sipariş öncesinde duvar ölçüsü, parça dizilimi ve görsel uyum açısından birlikte netleştirilir."
      />
    </PageShell>
  );
}

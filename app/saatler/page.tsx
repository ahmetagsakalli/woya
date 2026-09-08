import type { Metadata } from "next";
import { CatalogPageContent } from "../components/catalog-page-content";
import { PageShell } from "../components/page-shell";
import { storefrontProducts } from "@/lib/storefront";

export const metadata: Metadata = {
  title: "Dekoratif Saatler",
  description:
    "WOYA dekoratif saat modellerini, saat merkezli setleri ve kadran seçeneklerini inceleyin.",
  alternates: { canonical: "/saatler" },
};

export default async function ClocksPage() {
  const clockProducts = await storefrontProducts("saatler");
  return (
    <PageShell
      title="Dekoratif Saatler"
      text="Saat merkezli setlerde kadran dili, ton ve yan parça dengesi birlikte düşünülür."
    >
      <CatalogPageContent
        products={clockProducts}
        active="Saatler"
        note="Saat sayfalarında ana görselin yanında parça görünümü ve rakam stili detayları özellikle öne çıkarılır."
      />
    </PageShell>
  );
}

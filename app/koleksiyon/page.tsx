import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CatalogPageContent } from "../components/catalog-page-content";
import { PageShell } from "../components/page-shell";
import { storefrontProducts } from "@/lib/storefront";

export const metadata: Metadata = {
  title: "Koleksiyon",
  description:
    "WOYA dekoratif tablo ve saat koleksiyonlarını kategori, ton ve kullanım alanına göre keşfedin.",
  alternates: { canonical: "/koleksiyon" },
};

const collectionCards = [
  {
    title: "Tablo ve Saat Setleri",
    text: "Üç parçalı düzen, salon duvarında güçlü ama dengeli bir odak oluşturur.",
    href: "/tablolar",
  },
  {
    title: "Dekoratif Saatler",
    text: "Romen, normal ve minimal kadran seçenekleriyle saat merkezli kompozisyonlar.",
    href: "/saatler",
  },
  {
    title: "Kendi Setinizi Kurun",
    text: "Seçili WOYA parçalarını sol tablo, saat merkezi ve sağ tablo olarak birleştirin.",
    href: "/#kendi-tasariminiz",
  },
];

export default async function CollectionPage() {
  const sellableProducts = await storefrontProducts("koleksiyon");
  return (
    <PageShell
      title="WOYA Parçaları"
      text="Aynı dekor dili içinde farklı ton, desen ve saat merkezlerini bir araya getiren seçili ürün ailesi."
    >
      <section
        className="collection-story-section"
        aria-label="Koleksiyon yönlendirmeleri"
      >
        {collectionCards.map((card) => (
          <Link
            className="collection-story-card"
            href={card.href}
            key={card.title}
          >
            <span>{card.title}</span>
            <p>{card.text}</p>
            <ArrowUpRight aria-hidden="true" size={17} />
          </Link>
        ))}
      </section>
      <CatalogPageContent
        products={sellableProducts}
        active="Koleksiyon"
        note="Koleksiyon sayfası, ürünleri tek tek incelemek ve set tasarımına geçmek için ana geçiş alanıdır."
      />
    </PageShell>
  );
}

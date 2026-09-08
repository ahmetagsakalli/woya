import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductGrid } from "./product-card";
import type { WoyaProduct } from "../data/products";

const catalogLinks = [
  { label: "Tüm Ürünler", href: "/urunler" },
  { label: "Koleksiyon", href: "/koleksiyon" },
  { label: "Saatler", href: "/saatler" },
  { label: "Tablolar", href: "/tablolar" },
];

export function CatalogPageContent({
  products,
  active,
  note,
}: {
  products: WoyaProduct[];
  active: string;
  note: string;
}) {
  const collections = new Map<string, number>();
  products.forEach((product) => {
    collections.set(product.collectionLabel, (collections.get(product.collectionLabel) ?? 0) + 1);
  });

  return (
    <section className="catalog-page-section" aria-label="WOYA ürün kataloğu">
      <aside className="catalog-filter-rail">
        <nav aria-label="Katalog sayfaları">
          {catalogLinks.map((link) => (
            <Link data-active={link.label === active ? "true" : undefined} href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <p>{note}</p>
        <Link className="catalog-builder-link" href="/#kendi-tasariminiz">
          Setinizi kişiselleştirin
          <ArrowUpRight aria-hidden="true" size={16} />
        </Link>
      </aside>

      <div className="catalog-results">
        <div className="catalog-results-head">
          <div>
            <h2>{active}</h2>
            <p>{products.length} ürün listeleniyor.</p>
          </div>
          <div className="catalog-tags" aria-label="Koleksiyon dağılımı">
            {[...collections.entries()].map(([label, count]) => (
              <span key={label}>{label} · {count}</span>
            ))}
          </div>
        </div>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}

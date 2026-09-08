import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { WoyaProduct } from "../data/products";

export function ProductCard({ product }: { product: WoyaProduct }) {
  return (
    <article className="product-card">
      <Link
        className="product-card-image"
        href={`/urunler/${product.slug}`}
        aria-label={`${product.title} detayını aç`}
      >
        <Image
          src={product.image}
          alt={product.alt}
          fill
          style={{
            objectPosition: product.images?.[0]
              ? `${product.images[0].x}% ${product.images[0].y}%`
              : undefined,
          }}
          sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 25vw"
        />
      </Link>
      <div className="product-card-copy">
        <h3>
          <Link href={`/urunler/${product.slug}`}>{product.title}</Link>
        </h3>
        <p>{product.text}</p>
        {product.price != null && (
          <p>
            {product.salePrice != null && (
              <del>{product.price.toLocaleString("tr-TR")} ₺ </del>
            )}{" "}
            <strong>
              {(product.salePrice ?? product.price).toLocaleString("tr-TR")} ₺
            </strong>
          </p>
        )}
        <div className="product-card-actions">
          <Link className="card-action" href={`/urunler/${product.slug}`}>
            Ürünü İncele
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
          {product.productType !== "rehber" && (
            <Link
              className="card-action card-action-muted"
              href={`/urunler/${product.slug}#urun-olculeri`}
            >
              Ölçü Seç
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: WoyaProduct[] }) {
  return (
    <div className="product-gallery-grid">
      {products.map((product) => (
        <ProductCard product={product} key={product.slug} />
      ))}
    </div>
  );
}

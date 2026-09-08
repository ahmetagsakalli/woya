import "server-only";
import { cache } from "react";
import { getStorefrontCatalog, readCatalog } from "./admin/repository";
import { clockShapeFor } from "./pricing";
import { woyaProducts, type WoyaProduct } from "../app/data/products";
import type { BuilderParts } from "./admin/schema";

function publicBuilderParts(parts?: BuilderParts) {
  if (!parts) return undefined;
  const { enabled, left, center, right } = parts;
  return { enabled, left, center, right };
}

export const storefrontProducts = cache(async function storefrontProducts(
  surface?: "saatler" | "tablolar" | "koleksiyon",
) {
  const { products, categories } = await getStorefrontCatalog();
  return products
    .filter(
      (p) =>
        p.active &&
        categories.some(
          (c) =>
            c.id === p.categoryId &&
            c.active &&
            (!surface || c.surfaces.includes(surface)),
        ),
    )
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        (categories.find((c) => c.id === a.categoryId)?.position ?? 0) -
          (categories.find((c) => c.id === b.categoryId)?.position ?? 0) ||
        a.code.localeCompare(b.code, "tr", { numeric: true }),
    )
    .map((p): WoyaProduct => {
      const original = woyaProducts.find((o) => o.code === p.code);
      const category = categories.find((c) => c.id === p.categoryId)!;
      return {
        code: p.code,
        title: p.title,
        text: p.description,
        slug: p.slug,
        image: p.images[0].url,
        alt: p.images[0].alt || p.title,
        collection: p.categoryId,
        collectionLabel: category.title,
        motif: original?.motif ?? "Dekoratif",
        tone: original?.tone ?? "",
        room: original?.room ?? "Yaşam alanları",
        lead: p.description,
        highlights: original?.highlights ?? [],
        details: [
          { label: "Ürün tipi", value: category.title },
          ...(original?.details.filter((d) => d.label !== "Ürün tipi") ?? []),
        ],
        images: p.images,
        price: p.price,
        salePrice: p.salePrice,
        productType: p.type,
        clockShape: clockShapeFor(p),
        builderParts: publicBuilderParts(p.builderParts),
      };
    });
});
export async function storefrontProduct(slug: string) {
  return (await storefrontProducts()).find((p) => p.slug === slug);
}

export async function storefrontQuoteData() {
  const { products, categories, pricing } = await readCatalog();
  const activeCategories = new Set(categories.filter((c) => c.active).map((c) => c.id));
  return {
    products: products.filter((p) => p.active && activeCategories.has(p.categoryId)).map((p) => ({
      slug: p.slug, code: p.code, title: p.title, productType: p.type, clockShape: clockShapeFor(p), price: p.price, salePrice: p.salePrice, builderParts: publicBuilderParts(p.builderParts),
    })),
    settings: pricing,
  };
}

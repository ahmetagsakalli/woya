import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { initialProducts } from "../lib/admin/defaults";
import { productSchema, type ProductInput } from "../lib/admin/schema";
import { defaultCatalogProductPrice } from "../app/data/products";

const overwrite = process.argv.includes("--overwrite");

try {
  process.loadEnvFile(".env.local");
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(
    "DATABASE_URL gerekli. Bu script canlı/veri tabanı ortamında çalıştırılmalı.",
  );
  process.exit(1);
}

const sql = postgres(databaseUrl, { max: 1 });

const seededProducts = initialProducts().filter(
  (product) => product.type !== "rehber",
);
const seededBySlug = new Map(
  seededProducts.map((product) => [product.slug, product]),
);

function normalizedPrice(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function productInputFromRow(
  data: ProductInput,
  fallbackPrice: number,
): ProductInput {
  const currentPrice = normalizedPrice(data.price);
  const price =
    overwrite || currentPrice === null ? fallbackPrice : currentPrice;
  const salePrice = normalizedPrice(data.salePrice);

  return productSchema.parse({
    ...data,
    price,
    salePrice: salePrice !== null && salePrice < price ? salePrice : null,
  });
}

async function main() {
  let inserted = 0;
  let updated = 0;
  let kept = 0;

  await sql.begin(async (tx) => {
    for (const product of seededProducts) {
      const result = await tx`
        INSERT INTO woya_products(id, slug, code, category_id, data)
        VALUES(
          ${randomUUID()},
          ${product.slug},
          ${product.code},
          ${product.categoryId},
          ${tx.json(productSchema.parse(product))}
        )
        ON CONFLICT(slug) DO NOTHING
        RETURNING id
      `;
      inserted += result.length;
    }

    const rows = await tx<
      {
        id: string;
        slug: string;
        data: ProductInput;
        version: number;
      }[]
    >`SELECT id, slug, data, version FROM woya_products ORDER BY slug`;

    for (const row of rows) {
      if (row.data.type === "rehber") continue;
      const seeded = seededBySlug.get(row.slug);
      const fallbackPrice = seeded?.price ?? defaultCatalogProductPrice;
      const beforePrice = normalizedPrice(row.data.price);
      const nextData = productInputFromRow(row.data, fallbackPrice);

      if (
        beforePrice === nextData.price &&
        normalizedPrice(row.data.salePrice) ===
          normalizedPrice(nextData.salePrice)
      ) {
        kept += 1;
        continue;
      }

      const result = await tx`
        UPDATE woya_products
        SET data=${tx.json(nextData)}, version=version+1, updated_at=now()
        WHERE id=${row.id} AND version=${row.version}
        RETURNING id
      `;
      updated += result.length;
    }
  });

  console.log(
    `Katalog fiyatları hazır. Eklenen: ${inserted}, güncellenen: ${updated}, korunan: ${kept}.`,
  );
  console.log(
    overwrite
      ? `Tüm satılabilir ürün fiyatları varsayılan değere çekildi: ${defaultCatalogProductPrice} TL.`
      : `Boş fiyatlı satılabilir ürünler varsayılan değerle dolduruldu: ${defaultCatalogProductPrice} TL. Mevcut fiyatlar korundu.`,
  );
  console.log("Canlı önbellek açıksa görünmesi birkaç dakika sürebilir.");
}

main()
  .catch((error) => {
    console.error(
      error instanceof Error ? error.message : "İşlem tamamlanamadı.",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });

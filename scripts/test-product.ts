import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { productSchema } from "../lib/admin/schema";

const testProductSlug = "woya-5-tl-test-urunu";
const testProductCode = "9999-test";
const action = process.argv.includes("--remove") ? "remove" : "add";

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

const testProduct = productSchema.parse({
  title: "WOYA 5 TL Test Ürünü",
  slug: testProductSlug,
  categoryId: "tablo-saat-setleri",
  description:
    "Ödeme ve sepet akışını kontrollü şekilde denemek için kullanılan düşük tutarlı WOYA test ürünüdür.",
  price: 5,
  salePrice: null,
  stock: null,
  type: "set",
  active: true,
  featured: false,
  images: [
    {
      url: "/images/products/woya/woya-01.webp",
      alt: "WOYA 5 TL test ürünü",
      x: 50,
      y: 50,
    },
  ],
});

async function main() {
  if (action === "remove") {
    const rows = await sql`
      DELETE FROM woya_products
      WHERE slug=${testProductSlug}
      RETURNING id
    `;
    console.log(
      rows.length
        ? "5 TL test ürünü kaldırıldı."
        : "5 TL test ürünü zaten yok.",
    );
    return;
  }

  const [category] = await sql`
    SELECT id FROM woya_categories WHERE id=${testProduct.categoryId}
  `;
  if (!category) {
    throw new Error(
      "tablo-saat-setleri kategorisi bulunamadı. Önce admin kurulumu çalışmalı.",
    );
  }

  const [row] = await sql`
    INSERT INTO woya_products(id, slug, code, category_id, data)
    VALUES(
      ${randomUUID()},
      ${testProduct.slug},
      ${testProductCode},
      ${testProduct.categoryId},
      ${sql.json(testProduct)}
    )
    ON CONFLICT(slug) DO UPDATE SET
      code=${testProductCode},
      category_id=excluded.category_id,
      data=excluded.data,
      version=woya_products.version + 1,
      updated_at=now()
    RETURNING id, version
  `;

  console.log(
    `5 TL test ürünü hazır. URL: /urunler/${testProductSlug} · version: ${row.version}`,
  );
  console.log(
    "Canlı önbellek açıksa ürün en geç yaklaşık 5 dakika içinde görünebilir.",
  );
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

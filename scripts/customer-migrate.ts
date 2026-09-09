import { readFile } from "node:fs/promises";
import postgres from "postgres";
async function main() {
  // Deliberately do not load .env.local. Operator must explicitly select and approve the target.
  if (!process.argv.includes("--confirm-target") || !process.env.DATABASE_URL)
    throw new Error("TARGET_NOT_CONFIRMED");
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  try {
    await sql.begin(async (tx) => {
      await tx`SELECT pg_advisory_xact_lock(87002026)`;
      await tx.unsafe(await readFile("db/004-customer-accounts.sql", "utf8"));
    });
    console.log("Müşteri migration'ı tamamlandı. Mevcut siparişler korundu.");
  } finally {
    await sql.end();
  }
}
main().catch(() => {
  console.error(
    "Migration çalıştırılamadı. Önce yedek alın; hedef DATABASE_URL değerini açıkça ayarlayıp --confirm-target kullanın. Ayrıntılar CUSTOMER_ACCOUNTS.md içindedir.",
  );
  process.exitCode = 1;
});

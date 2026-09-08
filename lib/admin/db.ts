import "server-only";
import postgres from "postgres";

// Next's route bundles and development reloads share one connection pool per process.
const shared = globalThis as typeof globalThis & {
  woyaSql?: ReturnType<typeof postgres>;
};
export const databaseConfigured = () => Boolean(process.env.DATABASE_URL);
export function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_NOT_CONFIGURED");
  shared.woyaSql ??= postgres(process.env.DATABASE_URL, {
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
  return shared.woyaSql;
}

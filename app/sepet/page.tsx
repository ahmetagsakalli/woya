import type { Metadata } from "next";
import { CartPageClient } from "../components/cart-page-client";
import { PageShell } from "../components/page-shell";
import { paymentsAvailable } from "@/lib/payments/config";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Sepet",
  description: "WOYA alışveriş sepetiniz.",
  alternates: { canonical: "/sepet" },
};

export default async function CartPage() {
  await connection();
  return (
    <PageShell title="Sepetiniz">
      <CartPageClient paymentsEnabled={paymentsAvailable()} />
    </PageShell>
  );
}

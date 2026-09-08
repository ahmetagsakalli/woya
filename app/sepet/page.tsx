import type { Metadata } from "next";
import { CartPageClient } from "../components/cart-page-client";
import { PageShell } from "../components/page-shell";

export const metadata: Metadata = {
  title: "Sepet",
  description: "WOYA alışveriş sepetiniz.",
  alternates: { canonical: "/sepet" },
};

export default async function CartPage() {
  return (
    <PageShell title="Sepetiniz">
      <CartPageClient />
    </PageShell>
  );
}

import type { Metadata } from "next";
import { connection } from "next/server";
import { PageShell } from "../components/page-shell";
import { paymentsAvailable } from "@/lib/payments/config";
import { CheckoutForm } from "./ui";

export const metadata: Metadata = {
  title: "Ödeme",
  robots: { index: false, follow: false },
};
export default async function CheckoutPage() {
  await connection();
  return (
    <PageShell title="Siparişinizi tamamlayın">
      <CheckoutForm enabled={paymentsAvailable()} />
    </PageShell>
  );
}

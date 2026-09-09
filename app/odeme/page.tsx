import type { Metadata } from "next";
import { connection } from "next/server";
import { PageShell } from "../components/page-shell";
import { paymentsAvailable } from "@/lib/payments/config";
import { pageSession } from "@/lib/customer/auth";
import { addresses } from "@/lib/customer/accounts";
import type { Address } from "@/lib/customer/schema";
import { CheckoutForm } from "./ui";

export const metadata: Metadata = {
  title: "Ödeme",
  robots: { index: false, follow: false },
};
export default async function CheckoutPage() {
  await connection();
  const session = await pageSession();
  const savedAddresses = session ? ((await addresses()) as Address[]) : [];
  return (
    <PageShell title="Siparişinizi tamamlayın">
      <CheckoutForm
        enabled={paymentsAvailable()}
        account={{
          customer: session?.customer ?? null,
          addresses: savedAddresses,
        }}
      />
    </PageShell>
  );
}

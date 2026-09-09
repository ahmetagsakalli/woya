import { PageShell } from "@/app/components/page-shell";
import { PaymentView } from "../../result";
import { metadata } from "../../page";
export { metadata };
export default async function PaymentPage({
  params,
}: {
  params: Promise<{ oid: string }>;
}) {
  const { oid } = await params;
  return (
    <PageShell title="Güvenli ödeme">
      <PaymentView key={oid} oid={oid} showFrame />
    </PageShell>
  );
}

import { PageShell } from "@/app/components/page-shell";
import { PaymentView } from "../result";
import { metadata } from "../page";
export { metadata };
export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <PageShell title="Ödeme durumu">
      <PaymentView key={order || ""} oid={order || ""} />
    </PageShell>
  );
}

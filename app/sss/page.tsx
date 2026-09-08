import type { Metadata } from "next";
import { FaqSection } from "../components/faq-section";
import { PageShell } from "../components/page-shell";
import { getContent } from "@/lib/admin/repository";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
  description:
    "WOYA ürün, ölçü, yüzey, teslimat ve sipariş süreci hakkında sık sorulan sorular.",
  alternates: { canonical: "/sss" },
};

export default async function FaqPage() {
  const content = await getContent();
  return (
    <PageShell
      title="Muhtemelen Merak Ediyorsunuz"
      text="Ürün seçimi, sipariş hazırlığı ve teslimat sürecine dair kısa yanıtlar."
    >
      <FaqSection items={content.faqs} />
    </PageShell>
  );
}

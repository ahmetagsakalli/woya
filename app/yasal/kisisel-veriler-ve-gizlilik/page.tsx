import { LegalPage, legalMetadata } from "../legal-page";

export const metadata = legalMetadata("kisisel-veriler-ve-gizlilik");
export default function Page() {
  return <LegalPage slug="kisisel-veriler-ve-gizlilik" />;
}

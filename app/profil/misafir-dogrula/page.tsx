import Link from "next/link";
import { TokenForm } from "../forms";
export const metadata = { title: "Sipariş erişimini doğrula" };
export default function Page() {
  return (
    <>
      <h1>Sipariş erişimini doğrula</h1>
      <TokenForm action="guest-verify" />
      <p style={{ marginTop: 24 }}>
        <Link href="/profil">Girişe dön</Link>
      </p>
    </>
  );
}

import Link from "next/link";
import { TokenForm } from "../forms";
export const metadata = { title: "Yeni e-postayı doğrula" };
export default function Page() {
  return (
    <>
      <h1>Yeni e-postayı doğrula</h1>
      <TokenForm action="email-verify" />
      <p style={{ marginTop: 24 }}>
        <Link href="/profil">Girişe dön</Link>
      </p>
    </>
  );
}

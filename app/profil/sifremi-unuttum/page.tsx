import Link from "next/link";
import { EmailRequestForm } from "../forms";
export const metadata = { title: "Şifremi unuttum" };
export default function Page() {
  return (
    <>
      <h1>Şifremi unuttum</h1>
      <EmailRequestForm action="forgot" />
      <p style={{ marginTop: 24 }}>
        <Link href="/profil">Girişe dön</Link>
      </p>
    </>
  );
}

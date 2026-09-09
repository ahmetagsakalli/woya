import Link from "next/link";
import { EmailRequestForm } from "../forms";
export const metadata = { title: "E-posta doğrulama" };
export default function Page() {
  return (
    <>
      <h1>E-posta doğrulama</h1>
      <EmailRequestForm action="resend" />
      <p style={{ marginTop: 24 }}>
        <Link href="/profil">Girişe dön</Link>
      </p>
    </>
  );
}

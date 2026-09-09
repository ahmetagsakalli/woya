import Link from "next/link";
import { RegistrationForm } from "../forms";
export const metadata = { title: "Kayıt ol" };
export default function Page() {
  return (
    <>
      <h1>Kayıt ol</h1>
      <RegistrationForm />
      <p style={{ marginTop: 24 }}>
        <Link href="/profil">Girişe dön</Link>
      </p>
    </>
  );
}

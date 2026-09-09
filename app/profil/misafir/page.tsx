import Link from "next/link";
import { GuestForm } from "../forms";
export const metadata = { title: "Misafir sipariş takibi" };
export default function Page() {
  return (
    <>
      <h1>Misafir sipariş takibi</h1>
      <GuestForm />
      <p style={{ marginTop: 24 }}>
        <Link href="/profil">Girişe dön</Link>
      </p>
    </>
  );
}

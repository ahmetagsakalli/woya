import Link from "next/link";
import { TokenForm } from "../forms";
export const metadata = { title: "Şifreyi sıfırla" };
export default function Page() {
  return (
    <>
      <h1>Şifreyi sıfırla</h1>
      <TokenForm action="reset" />
      <p style={{ marginTop: 24 }}>
        <Link href="/profil">Girişe dön</Link>
      </p>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/site-chrome";
import { pageSession } from "@/lib/customer/auth";
import styles from "./account.module.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Hesabım",
  robots: { index: false, follow: false },
};
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await pageSession();
  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#hesap-icerik">
        İçeriğe geç
      </a>
      <SiteHeader />
      <main className={styles.main} id="hesap-icerik">
        <nav className={styles.nav} aria-label="Hesap menüsü">
          <Link href="/profil">{session ? "Profilim" : "Giriş yap"}</Link>
          {session && (
            <>
              <Link href="/profil/siparisler">Siparişlerim</Link>
              <Link href="/profil/adresler">Adreslerim</Link>
              <Link href="/profil/guvenlik">Hesap güvenliği</Link>
            </>
          )}
          <Link href="/profil/misafir">Misafir sipariş takibi</Link>
          <Link href="/sepet">Sepet</Link>
        </nav>
        {children}
      </main>
      <footer className={styles.footer}>
        <Link href="/yasal/kisisel-veriler-ve-gizlilik">
          Kişisel veriler ve gizlilik
        </Link>
        <Link href="/yasal/mesafeli-satis-sozlesmesi">Satış sözleşmesi</Link>
        <Link href="/iletisim">İletişim</Link>
      </footer>
    </div>
  );
}

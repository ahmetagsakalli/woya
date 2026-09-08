import { redirect } from "next/navigation";
import { authConfigured, session } from "@/lib/admin/auth";
import { LoginForm } from "../ui/login";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ parola?: string }>;
}) {
  if (await session()) redirect("/admin");
  const { parola } = await searchParams;
  return (
    <main className="admin-login">
      <section>
        <a href="/" className="admin-wordmark">
          WOYA
        </a>
        <h1>Yönetim Girişi</h1>
        {parola === "degisti" && (
          <p role="status" className="admin-success">
            Şifreniz değiştirildi. Yeni şifrenizle giriş yapın.
          </p>
        )}
        {authConfigured() ? (
          <LoginForm />
        ) : (
          <div className="admin-notice">
            <h2>Kurulum bekleniyor</h2>
            <p>
              Yönetim erişimi henüz açılmadı. Veritabanı ve yönetici hesabı
              yapılandırıldığında buradan giriş yapabilirsiniz.
            </p>
            <p>
              Kurulum adımları proje içindeki <code>ADMIN.md</code> dosyasında.
            </p>
          </div>
        )}
        <a className="admin-back" href="/">
          Mağazaya dön
        </a>
      </section>
    </main>
  );
}

"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="admin-notice" role="alert">
      <h1>Verilere ulaşılamadı</h1>
      <p>
        Veritabanı bağlantısını ve kurulumun tamamlandığını kontrol edin.
        Değişiklik yapılmadı.
      </p>
      <button onClick={reset}>Tekrar dene</button>
      <a href="/admin/giris">Giriş sayfası</a>
    </div>
  );
}

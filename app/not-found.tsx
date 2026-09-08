import Link from "next/link";

export default function NotFound() {
  return (
    <main className="error-page">
      <h1>Aradığınız sayfa bulunamadı.</h1>
      <p>WOYA ana sayfasından koleksiyonları incelemeye devam edebilirsiniz.</p>
      <Link href="/">Ana Sayfaya Dön</Link>
    </main>
  );
}

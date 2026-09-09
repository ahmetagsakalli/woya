"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section>
      <h1>Hesap bilgileri alınamadı</h1>
      <p role="alert">Bağlantıyı kontrol edip yeniden deneyin.</p>
      <button onClick={reset}>Yeniden dene</button>
    </section>
  );
}

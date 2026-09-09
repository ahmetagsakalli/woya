"use client";
export default function PaymentError({ reset }: { reset: () => void }) {
  return (
    <section style={{ padding: 32 }}>
      <h2>Ödeme sayfası açılamadı</h2>
      <p>
        Ödeme yaptıysanız yeniden denemeden önce sipariş durumunuzu kontrol
        edin.
      </p>
      <button onClick={reset}>Sayfayı yeniden yükle</button>
    </section>
  );
}

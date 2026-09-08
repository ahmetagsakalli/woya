# Yasal sayfalar

8 Eylul 2026 tarihinde WOYA'nin mevcut kod akisi ve kullanicinin verdigi
iletisim bilgileri esas alinarak hazirlanan genel metinlerdir. Hukuki
uygunluk garantisi veya isletme icin tamamlanmis bir hukuk incelemesi degildir.

## Adresler ve dosyalar

- `/yasal/on-bilgilendirme-formu`
- `/yasal/mesafeli-satis-sozlesmesi`
- `/yasal/kisisel-veriler-ve-gizlilik`
- `/yasal/cerez-politikasi`

Icerik `lib/legal-documents.ts`, yollar ve dogrulanmis iletisim varsayilanlari
`lib/legal.ts`, ortak sunucu sayfasi `app/yasal/legal-page.tsx` icindedir.
Admin Site Icerigi'ndeki dolu adres/e-posta degerleri korunur. Eski bos
alanlar kullanicinin verdigi bilgilerle okunur. Eski Yasal footer linkleri
yalnizca bilinen `/iletisim` yer tutuculariysa duzeltilir; baska bir ozel
baglanti veya silinmis bir menu ogesi zorla geri eklenmez.
Bu islem canli veritabanina yazmaz; sonraki admin kaydi duzeltilmis
degerleri kalici kayda alir. Kayit surumu ve diger alanlar degismez.

## Gercek satis acilmadan once

- Resmi satici unvani, veri sorumlusu kimligi, uygulanabilir MERSIS/vergi
  bilgileri ve kayitli adres teyit edilmeli. WOYA marka adi sirket unvani
  olarak varsayilmadi. Kullanici posta adresi, telefon ve e-posta verdi;
  resmi unvan/vergi bilgisi vermedi. Bu bilgiler genel metinlere eklenmeli.
- Urune gore uretim/teslim taahhudu, iade tasiyicisi ve iade adresi,
  gonderim kisitlamalari ve 2.000 TL alti kargo bedeli teyit edilmeli.
  Uydurma bir sure, ucret veya kargo anlasmasi yazilmadi.
- Alici, urunler, olculer, bedel, teslimat ve satici bilgileriyle doldurulmus
  on bilgilendirme/sozlesme her islem icin kalici veri saklayicisinda
  sunulmali ve saklanmali. Su anki genel sayfalar ve odeme kaydindaki
  belge surumu/zaman damgasi bunun tamamlandigi anlamina gelmez.
- Ozel uretim istisnasi yalnizca gercekten tuketicinin istegine gore
  hazirlanan mallar icin siparis oncesi belirtilmeli. Standart varyant
  secimi veya tum setler icin genel bir iade yasagi uygulanmamali.
- Veri sorumlusu, gercek hizmet saglayicilarini, barindirma ulkelerini,
  yurt disi aktarim mekanizmasini, kategori bazli saklama/imha surelerini
  ve ilgili kisi basvuru surecini hukuk danismaniyla netlestirmeli.
- Google Haritalar iframe'i mevcut sitede otomatik yuklenebilir. Bu
  calisma izin yoneticisi eklemez. Gerekli ucuncu taraf rizasi alinmadan
  yuklememek icin ayri bir izinli harita yukleme akisi degerlendirilmeli.
  Politikada var olmayan bir onay paneli varmis gibi yazilmadi.
- PayTR'nin gercek test kabulunu tamamlayin; onaylanmis metinlerle
  `CHECKOUT_LEGAL_VERSION` belirleyin. Bu degisiklik odemeyi acmaz,
  `.env.local` veya Vercel ayarlarini degistirmez.

## Dayanaklar

Metinler ozgun ozetlerdir; isletmenin somut kosullari icin hukuk incelemesi gerekir.
Iade surelerinde eski yonetmelik PDF'si yerine guncel Bakanlik aciklamasi esas alindi.

- [Ticaret Bakanligi, mesafeli sozlesmeler rehberi (17 Agustos 2026)](https://tuketici.ticaret.gov.tr/yayinlar/tuketici-bilgi-rehberi/mesafeli-sozlesmeler-hakkinda-bilgilendirme)
- [Mesafeli Sozlesmeler Yonetmeligi, ilk yayim (degisiklikler ayrica degerlendirilmeli)](https://ticaret.gov.tr/data/5d42aa1613b87632542a2db3/575c6563fca6dc205ef582989cec3272.pdf)
- [KVKK, aydinlatma yukumlulugu](https://www.kvkk.gov.tr/Icerik/2033/Aydinlatma-Yukumlulugu-)
- [KVKK, ilgili kisinin haklari](https://www.kvkk.gov.tr/Icerik/2036/Ilgili-Kisinin-Haklari)
- [KVKK, basvuru hakki](https://www.kvkk.gov.tr/Icerik/2062/Basvuru-Hakki)
- [KVKK, yurt disina aktarim](https://www.kvkk.gov.tr/Icerik/2053/Yurtdisina-Aktarim)
- [KVKK, cerez uygulamalari rehberi (Temmuz 2025)](https://www.kvkk.gov.tr/Icerik/7353/Cerez-Uygulamalari-Hakkinda-Rehber)

## Müşteri hesabı eklemesi

`CUSTOMER_ACCOUNTS.md` ile gelen hesap, adres defteri, sunucuda kalıcı sepet,
Resend hesap e-postaları, misafir erişim doğrulaması ve başvuru mesajları
gizlilik/çerez envanterine teknik davranışlarıyla eklendi. Mevcut hukuki
koşullar ve süreler değiştirilmedi. Resend'in fiili kullanımı öncesinde
sağlayıcı sözleşmesi, veri aktarımı ve saklama/imha uygulaması teyit edilmeli.
Hesap kapatma giriş erişimini kapatır; hukuken saklanması gereken kayıtları
silmez. Operasyonel kapatma ve imha sürecini işletme tamamlamalıdır. Sipariş
özeti ve fatura adresinin değişmez saklanması, siparişe özel sözleşme veya
gerçek fatura belgesi üretildiği anlamına gelmez; yukarıdaki eksikler sürer.

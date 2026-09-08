# PayTR kurulumu

Bu entegrasyon PayTR **iFrame API** kullanir. Kart numarasi, CVV veya son
kullanma tarihi WOYA formuna, sunucusuna veya veritabanina gonderilmez.
PayTR ekranindaki bilgiler dogrudan PayTR'ye gider.

Varsayilan olarak `PAYTR_ENABLED=false`, `PAYTR_TEST_MODE=1`.
Kodun yuklenmesi tek basina odemeyi acmaz. Bu calismada canli ortama
deploy, canli veritabani migration'i veya gercek tahsilat yapilmadi.

## Ortam degiskenleri

Degerleri `.env.local` ya da sunucunun gizli ortam ayarlarinda tutun.
Hicbir PayTR anahtarina `NEXT_PUBLIC_` oneki eklemeyin. Sohbette veya baska
bir yerde paylasilmis anahtarlari canli kullanimdan once PayTR'den yenileyin.

| Degisken | Aciklama |
| --- | --- |
| `DATABASE_URL` | Kalici PostgreSQL baglantisi |
| `APP_URL` | Magazanin sabit HTTPS adresi, sonunda yol olmadan |
| `PAYTR_ENABLED` | `true` odeme olusturmayi acar; varsayilan `false` |
| `PAYTR_TEST_MODE` | `1` test; yalnizca kabul testinden sonra `0` |
| `PAYTR_MERCHANT_ID` | PayTR magaza numarasi |
| `PAYTR_MERCHANT_KEY` | Sunucuya ozel magaza anahtari |
| `PAYTR_MERCHANT_SALT` | Sunucuya ozel gizli anahtar |
| `PAYTR_TRUSTED_IP_HEADER` | Guvenilir proxy'nin UZERINE YAZDIGI tek IP basligi; VPS icin `x-real-ip` |
| `PAYTR_TEST_USER_IP` | Sadece yerel testte kullanilabilen harici IP; canli modda yok sayilir |
| `CHECKOUT_SHIPPING_FEE_KURUS` | Esik altindaki kargo bedeli, tam sayi kurus; belirlenmeden tahmin edilmez |
| `CHECKOUT_FREE_SHIPPING_KURUS` | Varsayilan `200000` (mevcut sitedeki 2.000 TL esigi) |
| `CHECKOUT_TERMS_PATH` | Yayinlanmis mesafeli satis sozlesmesinin site ici yolu |
| `CHECKOUT_INFORMATION_PATH` | Yayinlanmis on bilgilendirme formunun site ici yolu |
| `CHECKOUT_LEGAL_VERSION` | Musterinin onayladigi belge surumu; ornegin bir yayin tarihi |

Canli modda yasal belge yollari ve surumu eksikse odeme acilmaz. Kod belge
icerigi uydurmaz veya hukuki uygunluk garantisi vermez. Genel metinler
`/yasal/mesafeli-satis-sozlesmesi` ve `/yasal/on-bilgilendirme-formu`
adreslerinde bulunur. Eski footer `/iletisim` yer tutuculari okuma sirasinda
gercek yollara donusturulur; ozel olarak degistirilmis linkler korunur.
Bu sayfalarin eklenmesi hukuki kabul veya odeme aktivasyonu degildir.
Resmi satici kimligi, siparise ozel kalici belgeler ve diger yayin oncesi
gereksinimler icin `LEGAL.md` kontrol listesini tamamlayin.
Belgelerde degisiklik yapinca surumu de degistirin. Onay zamani ve surumu
odeme kaydinda tutulur. Kisisel veriler icin erisim, yedekleme ve saklama
suresi politikasini isletmenin gereksinimlerine gore belirleyin.

## Veritabani

Once yedek alin, sonra hedef ortamin dogru `DATABASE_URL` degeriyle:

```sh
pnpm admin:setup
```

`db/003-paytr.sql` tekrar calistirilabilir. Var olan urun, siparis ve admin
sifresini degistirmez. `woya_payments` odeme denemelerini, ozel tarayici
oturumunun hash'ini, PayTR islem numarasini ve bildirim sonucunu tutar.
`woya_orders.payment` ayni transaction'da guncellenen admin ozetidir.
Katalog degisse veya urun silinse bile siparisin fiyat/olcu secimi korunur.

## PayTR paneli ve VPS

1. PayTR panelinde **Destek & Kurulum > Ayarlar > Bildirim URL** alanina
   `https://SIZIN-ALAN-ADINIZ/api/paytr/bildirim` girin.
2. Bildirim adresi halka acik HTTPS olmali. Giris, CSRF/Origin kontrolu,
   CAPTCHA, IP tahminiyle engelleme veya yonlendirme eklemeyin. Kimlik
   dogrulama, PayTR HMAC imzasi ile yapilir.
3. VPS'te Node portunu disari kapatin; sadece guvenilir ters proxy erissin.
   Nginx'in `proxy_set_header X-Real-IP $remote_addr;` ayariyla basligi
   sifirdan yazmasini saglayin. Arada baska proxy varsa guven zincirini
   ayrica yapilandirin. Istemciden gelen `X-Forwarded-For` zincirine guvenilmez.
4. `PAYTR_ENABLED=true`, `PAYTR_TEST_MODE=1` ile kontrollu test yapin.
   Localhost callback'i PayTR'den erisilebilir degildir; gercek kabul testi
   icin size ait HTTPS test ortami gerekir.
5. PayTR test odemesini, callback'teki tam `OK` yanitini ve PayTR panelindeki
   sonucu dogrulayin. Mobil 3D Secure donusunu da gercek cihazda kontrol edin.
6. Isletme, kargo ve yasal metinleri tamamlayin; PayTR magazasinin canli modda
   oldugunu dogrulayin. Ancak bundan sonra `PAYTR_TEST_MODE=0` secin.

## Akis ve adresler

- `/sepet`: mevcut sepet, fiyat kontrolu ve odemeye gecis.
- `/odeme`: teslimat formu, sunucudan gelen fiyat/kargo ozeti ve onay.
- `/odeme/islem/[merchant_oid]`: PayTR kart formu; ozel HttpOnly tarayici
  cookie'si olmayan kisi iframe tokenini goremez.
- `/odeme/sonuc?order=...`: bildirim sonucu; URL'deki basari iddiasi dikkate alinmaz.
- `/api/odeme/ozet`, `/api/odeme/baslat`: ayni kaynaktan POST, sinirli
  istek boyutu, dogrulama ve hiz siniri.
- `/api/odeme/durum`: cookie ile erisilen, onbellege alinmayan sonuc.
- `/api/paytr/bildirim`: PayTR sunucusundan gelen form POST bildirimi.
- `/admin/siparisler`: odeme, test ve siparis durumlari birbirinden ayrilir.

Hazir olculer saticinin fiyatini, yalnizca ozel olculer mevcut m2 oranlarini
kullanir. Adet, aktiflik ve fiyatlar odeme baslatilirken yeniden okunur.
Ozet degismisse musteri yeniden onaylar. Istemcinin verdigi fiyat kabul
edilmez. Tek cekim kullanilir; vade farki veya taksit hesaplanmaz.

Tekrar gonderimler ayni islemi acar. Ayni tarayicinin baska bir request ID
ile ikinci bir bekleyen odeme acmasi da engellenir. Aktif eski bir islem
varsa once o islemin ozeti/durumu gosterilir; yeni sepet otomatik tahsil edilmez.
Odemesi onaylanan gercek sipariste satin alinan adetler sepetten bir kez
cikarilir; sonradan eklenen diger urunler korunur. Testte sepet temizlenmez.

## Hata ve operasyon

- Bildirimdeki imza sabit zamanda karsilastirilir. Siparis satirlari transaction
  kilidiyle islenir. Tekrarlanan bildirim ikinci siparis veya gonderim yaratmaz.
- Yalnizca imzasi gecerli, beklenen tutar/para birimi ile eslesen gercek odeme
  siparisi otomatik onaylar. Test odemesi gercek satis sayilmaz ve admin'den
  hazirlaniyor/kargoda/tamamlandi durumuna gecirilemez.
- Imzali ama tutari veya modu tutarsiz odeme `review` durumunda saklanir;
  admin PayTR panelinden kontrol etmelidir. Kayit kalici yazildiktan sonra
  `OK` yaniti verilir. Bilinmeyen siparis, hatali imza ve DB hatasi `OK` almaz.
- Token isteginde ag kesilmesi/zaman asimi belirsizdir. Otomatik yeniden
  tahsilat denemesi yapilmaz; `pending` bekler. Callback hic gelmiyorsa
  PayTR paneli/destegi ile islem netlestirilmelidir. Bu surumde otomatik durum
  sorgulama/mutabakat servisi yoktur. Kaydi DB'den gelisiguzel silmeyin.
- Basarisiz token cevabinin teknik metni musterilere/loglara yazilmaz.
- Siparisi admin'den iptal etmek **para iadesi degildir**. Bu surumde iade,
  kismi iade, SMS/e-posta ve taksit entegrasyonu yoktur. Iadeyi PayTR panelinde
  tamamlayip ic nota islem referansini yazin. Iptalden sonra gec gelen basarili
  odeme kaydedilir ama siparis otomatik yeniden acilmaz.
- `PAYTR_ENABLED=false` yeni odemeyi kapatir; baslamis odemelerin bildirimleri
  islenmeye devam eder. Anahtarlari devam eden islemler varken degistirmeyin.
- `creating/ready/pending/review` durumunda musteriye yeniden odeme yaptirmayin.
  Bildirim sonuclarina ve PayTR paneline gore operasyonel kontrol gerekir.

## Testler

```sh
pnpm test:payments
pnpm typecheck
pnpm build
pnpm test:payments:http
pnpm test:admin:http
```

HTTP testi gecici PGlite veritabani ve rastgele sahte anahtarlar kullanir.
`tests/fixtures/paytr-provider.mjs` yalnizca test sunucusuna Node preload
olarak yuklenir; gercek PayTR isteklerini taklit eder. Uygulamada mock
endpoint'i veya gercek odemeymis gibi davranan demo modu yoktur.
Bu testler gercek PayTR kabul testinin ve cihaz testinin yerine gecmez.

Protokol kaynaklari: [PayTR iFrame 1. adim](https://dev.paytr.com/iframe-api/iframe-api-1-adim)
ve [PayTR bildirim 2. adim](https://dev.paytr.com/iframe-api/iframe-api-2-adim).

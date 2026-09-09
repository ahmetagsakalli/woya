# WOYA

Next.js App Router ile gelistirilen tablo ve saat magazasi ve yonetim paneli.

- Magaza: https://woya-tablo.vercel.app
- Yonetim: `/admin/giris`
- Urunler, kategoriler, site icerigi, medya ve fiyatlandirma yonetimi
- Fotograf uzerinden perspektif duzeltmeli sol tablo / saat / sag tablo kirpma
- Kendin Olustur, kalici tarayici sepeti ve sunucuda fiyat dogrulamasi
- Hazir urunlerde satici fiyati; yalnizca ozel olculerde m2 fiyatlandirmasi

## Yerel Gelistirme

Node.js 22+ ve pnpm gerekir. Node.js 24 ile test edilmistir.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Magaza `http://localhost:3000` adresinde acilir. Veritabani olmadan katalog
goruntulenebilir; yonetim paneli icin PostgreSQL ve guvenli oturum ayarlari gerekir.
`.env.example` gerekli degiskenleri listeler. Gercek degerleri Git tarafindan
dislanan `.env.local` dosyasinda veya yayin ortaminin secret ayarlarinda tutun.

Veritabani ilk kurulumu, parola olusturma, Vercel Blob ve VPS depolama ayarlari
icin [yonetim ve kurulum rehberine](ADMIN.md) bakin.
VPS'e kaynak klasorunu komple kopyalamayin; hafif standalone yayin paketi icin
[VPS yayin rehberini](VPS_DEPLOYMENT.md) kullanin.

Canli veritabaninda fiyati bos kalan satilabilir urunleri 1.500 TL baslangic
fiyatiyla doldurmak icin `pnpm catalog:prices` calistirin. Mevcut fiyatlari
bilerek sifirdan ayni degere cekmek icin `pnpm catalog:prices:overwrite`
kullanilir.

## Kontroller

```sh
pnpm typecheck
pnpm test:admin
pnpm test:pricing
pnpm test:artwork
pnpm test:crop
pnpm test:payments
pnpm build
pnpm test:admin:http
pnpm test:payments:http
```

HTTP testleri once production build ister; kendi gecici PGlite veritabanini ve
gorsel klasorunu kullanir, canli veritabanini degistirmez.

## Yayin ve Veriler

Vercel uzerinde PostgreSQL ve Vercel Blob kullanilir. VPS icin kalici yerel
gorsel depolama da desteklenir. Repo kaynak kodunu ve paketlenmis katalog
gorsellerini icerir; canli veritabani kayitlari ve sonradan yuklenen Blob
gorselleri ayri kaynaklardir ve bu repo bir veritabani yedegi degildir.
VPS yayininda `pnpm vps:package` ile olusan `dist/woya-vps-standalone.tar.gz`
paketini gonderin; `.git`, tam gelistirme `node_modules`, `.next/cache`,
`work` ve `.env*` sunucuya kopyalanmaz.

PayTR iFrame odeme entegrasyonu mevcuttur; varsayilan olarak kapalidir.
Gizli degerler, migration, callback ve kabul testi icin [PayTR rehberi](PAYTR.md).
GitHub'a kod yuklemek odeme aktivasyonu veya gercek tahsilat yapildigi anlamina gelmez.
Trendyol servis katmani hazirdir, gercek anahtarlar olmadan veri cekmez.
Secret dosyalari, `.vercel`, `node_modules`, build ve test ciktilari Git'e eklenmez.

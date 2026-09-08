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

## Kontroller

```sh
pnpm typecheck
pnpm test:admin
pnpm test:pricing
pnpm test:artwork
pnpm test:crop
pnpm build
pnpm test:admin:http
```

HTTP testleri once production build ister; kendi gecici PGlite veritabanini ve
gorsel klasorunu kullanir, canli veritabanini degistirmez.

## Yayin ve Veriler

Vercel uzerinde PostgreSQL ve Vercel Blob kullanilir. VPS icin kalici yerel
gorsel depolama da desteklenir. Repo kaynak kodunu ve paketlenmis katalog
gorsellerini icerir; canli veritabani kayitlari ve sonradan yuklenen Blob
gorselleri ayri kaynaklardir ve bu repo bir veritabani yedegi degildir.

Odeme entegrasyonu henuz bagli degildir; uygulama tahsilat yapmaz.
Trendyol servis katmani hazirdir, gercek anahtarlar olmadan veri cekmez.
Secret dosyalari, `.vercel`, `node_modules`, build ve test ciktilari Git'e eklenmez.

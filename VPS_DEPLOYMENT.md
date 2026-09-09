# VPS yayin paketi

Bu proje VPS'e kaynak klasorunun tamamini kopyalamamalidir. Yereldeki
`node_modules`, `.next/cache`, `.git`, `work`, `dist` ve `.env*` klasor/dosyalari
sunucuya gonderilmez.

## Hafif paket olusturma

Yerelde veya CI ortaminda:

```sh
pnpm install --frozen-lockfile
pnpm vps:package
```

Komut once `next build` calistirir, sonra `dist/woya-vps-standalone.tar.gz`
dosyasini olusturur. Paket Next.js standalone runtime, `.next/static` ve `public`
dosyalarini icerir.

Paketin yaninda `dist/woya-vps-standalone.tar.gz.sha256` dosyasi uretilir.
Sunucuda arsiv acilmadan once hash kontrolu yapilabilir.

## VPS'e gonderilecek dosya

Sadece su dosya gonderilir:

```sh
dist/woya-vps-standalone.tar.gz
```

Gonderilmeyecekler:

- `.env.local` ve tum secret dosyalari
- `.git`
- tam gelistirme `node_modules` klasoru
- `.next/cache`
- `work`
- `tests`
- `outputs`

Paket icinde Next.js standalone trace tarafindan secilen kucuk runtime
`node_modules` parcalari kalir. Bu beklenen davranistir; full dependency
klasoru VPS'e tasinmaz.

## Sunucuda dizin yapisi

Onerilen yapi:

```txt
/opt/woya/releases/2026-09-09-001
/opt/woya/current -> /opt/woya/releases/2026-09-09-001
/etc/woya/woya.env
/var/lib/woya/uploads
```

`/etc/woya/woya.env` release klasorunun disinda kalir. Ortam degiskenleri
Git'e veya arsive girmez.

`/var/lib/woya/uploads` release klasorunun disinda kalir. Yeni release atilirken
sonradan yuklenen urun gorselleri silinmez.

## Calistirma

Arsivi acin ve `current` symlink'ini yeni release'e cevirin:

```sh
mkdir -p /opt/woya/releases/2026-09-09-001
tar -xzf woya-vps-standalone.tar.gz -C /opt/woya/releases/2026-09-09-001
ln -sfn /opt/woya/releases/2026-09-09-001 /opt/woya/current
```

Uygulamayi ters proxy arkasinda localhost uzerinden calistirin:

```sh
cd /opt/woya/current
PORT=3000 HOSTNAME=127.0.0.1 node server.js
```

Production'da bu komutu systemd veya process manager calistirmalidir.
Node portu internete acilmamalidir; disaridan yalnizca 80/443 ters proxy
erismelidir.

## Gerekli dis baglantilar

VPS'te ortam degiskenlerini release disinda tutun. Asgari olarak:

- `APP_URL`
- `NEXT_PUBLIC_SITE_URL`
- `DATABASE_URL`
- `ADMIN_SESSION_SECRET`
- `STORAGE_DRIVER`
- `UPLOAD_DIR` veya `BLOB_READ_WRITE_TOKEN`
- `CUSTOMER_AUTH_SECRET`
- `CUSTOMER_EMAIL_API_KEY`
- `CUSTOMER_EMAIL_FROM`
- PayTR acilacaksa `PAYTR_*` degerleri

`NEXT_PUBLIC_SITE_URL` build sirasinda istemci paketine yazilir. Alan adi
degisecekse paketi o alan adi degeriyle yeniden uretin.

## Temizlik

VPS'te eski release'leri sinirli tutun. Ornegin son 3 release kalsin; daha
eskileri silinsin. `current`, `/etc/woya/woya.env`, PostgreSQL verisi ve
`/var/lib/woya/uploads` silinmemelidir.

## Geri donus

Yeni surumde sorun olursa `current` symlink'ini onceki release'e cevirip servisi
yeniden baslatin:

```sh
ln -sfn /opt/woya/releases/ONCEKI_RELEASE /opt/woya/current
systemctl restart woya
```

Sonra ana sayfa, `/urunler`, `/profil`, `/admin/giris` ve odeme kapali/acik
durumunu kontrol edin.

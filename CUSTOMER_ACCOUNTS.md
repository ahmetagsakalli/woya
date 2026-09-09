# Müşteri hesapları ve satış sonrası işlemler

Bu çalışma `feat/paytr-checkout` temelinden `feat/customer-accounts` dalında
hazırlandı. `/profil` yer tutucusu gerçek müşteri hesabıyla değiştirildi.
Admin kimliği, şifresi, oturum tablosu ve yetkileri müşterilerden ayrıdır.
Canlı veritabanında migration, Vercel ayarı/deploy veya gerçek tahsilat yapılmadı.

## Sayfalar

| URL                              | İşlev                                                                                  |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| `/profil`                        | Giriş, profil düzenleme, çıkış                                                         |
| `/profil/kayit`                  | E-posta/şifre ile kayıt                                                                |
| `/profil/dogrulama-gonder`       | Doğrulama bağlantısını yeniden isteme                                                  |
| `/profil/dogrula`                | Tek kullanımlık e-posta doğrulama                                                      |
| `/profil/sifremi-unuttum`        | Şifre sıfırlama bağlantısı isteme                                                      |
| `/profil/sifre-sifirla`          | Yeni şifre belirleme                                                                   |
| `/profil/eposta-dogrula`         | Yeniden kimlik doğrulama sonrası yeni adresi doğrulama                                 |
| `/profil/adresler`               | Adres ekleme, düzenleme, silme ve ayrı varsayılanlar                                   |
| `/profil/guvenlik`               | Şifre/e-posta değişimi, oturum listesi, diğer oturumları kapatma, hesap kapatma talebi |
| `/profil/siparisler`             | Hesaba ait siparişler, 20 kayıtlık sayfalama                                           |
| `/profil/siparisler/[reference]` | Değişmez sipariş özeti, kargo, geçmiş ve başvurular                                    |
| `/profil/misafir`                | Sipariş e-postasına güvenli erişim bağlantısı isteme                                   |
| `/profil/misafir-dogrula`        | İki saatlik, tek siparişle sınırlı misafir erişimi                                     |
| `/odeme`                         | Üyeliksiz alışveriş; hesap adresleriyle doldurma ve ayrı fatura adresi                 |
| `/admin/siparisler/[id]`         | Kargo firması/takip numarası, sipariş durumu ve müşteri başvuruları                    |
| `/admin/musteri-islemleri`       | Başvurular ve hesap kapatma talepleri                                                  |

Müşteri API'si `/api/hesap/[action]`, yönetim API'si
`/api/admin/customer-service` altındadır. Profil sayfaları ve API'nin hata
cevapları dahil tüm özel yanıtlar `private, no-store` kullanır.

## Sunucu yapılandırması

| Değişken                     | Gereksinim                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`               | Mevcut PostgreSQL bağlantısı; migration uygulanmış olmalı                                                   |
| `APP_URL`                    | Sabit HTTPS mağaza kökü; sadece yerel testte localhost/127.0.0.1 HTTP kabul edilir                          |
| `CUSTOMER_AUTH_SECRET`       | En az 32 karakter rastgele, admin sırrından bağımsız; deneme sınırı anahtarlarını HMAC ile takma adlandırır |
| `CUSTOMER_EMAIL_API_KEY`     | Resend sunucu API anahtarı; `NEXT_PUBLIC_` kullanmayın                                                      |
| `CUSTOMER_EMAIL_FROM`        | Doğrulanmış gönderici, ör. işletmenin doğruladığı e-posta veya `WOYA <adres>`                               |
| `CUSTOMER_TRUSTED_IP_HEADER` | İsteğe bağlı tek IP başlığı; yalnızca güvenilir proxy başlığı yeniden yazıyorsa ayarlayın                   |

E-posta servisi `lib/customer/email.ts` içinde sabit
`https://api.resend.com/emails` adresine HTTPS istek gönderir. Alan adı ve
SPF/DKIM doğrulamasını, sağlayıcının teslimat/bounce görünümünü, işletme adına
sağlayıcı sözleşmesi ve veri işleme/aktarım gereksinimlerini ayrıca tamamlayın.
API kabulü, e-postanın mutlaka gelen kutusuna ulaştığı garantisi değildir.
Servis eksik veya başarısızsa 503 döner; bağlantı yanıt/loglara yazılmaz.
Başarısız gönderimin tokenı kaldırılır. Doğrulama yeniden istenebilir.

`CUSTOMER_AUTH_SECRET` ayarlanmadığında hesap yazma işlemleri 503 verir;
misafir checkout mevcut PayTR koşullarıyla çalışmaya devam eder. Mevcut
`PAYTR_*`, kargo ve yasal belge ayarları otomatik değiştirilmez; `PAYTR.md`
ve `LEGAL.md` gereksinimleri devam eder. Uygulamayı doğrudan internete açmayın:
proxy dışındaki Node erişimini kapatın. Başlık ayarlanmazsa tüm istemciler
korumacı ortak IP deneme kotasını paylaşır; üretimde güvenilir proxyyi kurun.

## Migration

1. Hedef veritabanını ve yedeği işletme yetkilisiyle doğrulayın. Testleri gerçek
   müşteri veritabanına karşı çalıştırmayın.
2. Mevcut `001-admin.sql`, `002-admin-security.sql` ve `003-paytr.sql`
   uygulanmış olmalı. Yeni migration `db/004-customer-accounts.sql`.
3. Onaylı hedefin `DATABASE_URL` değerini gizli terminal ortamında ayarlayın.
   Yeni script `.env.local` dosyasını kendiliğinden yüklemez:

   ```sh
   pnpm customer:migrate --confirm-target
   ```

4. Sıfır kurulumdaki `pnpm admin:setup` da 004'ü transaction içinde uygular;
   bu komut `.env.local` okuyabilir. Hedef ortamı kontrol etmeden çalıştırmayın.
5. 004 yeniden çalıştırılabilir; tablo/indeksler `IF NOT EXISTS` kullanır.
   Var olan siparişleri müşteriye otomatik bağlamaz, eski fatura adresi
   uydurmaz, ürünü/admin şifresini yeniden yazmaz. Snapshot trigger'ı alıcı,
   ürün/fiyat/ölçü, fatura, not, referans, tarih ve temel ödeme tutarlarının
   sonradan değişmesini engeller. Operasyonel durum/kargo ve yetkili sahiplik
   bağlama ayrı alanlardır.
6. Sürüm geri alınırsa yeni tabloları veya siparişleri silmeyin. Eski uygulama
   kodu müşteri işlevlerini sunamaz; yedekten dönüş ayrı bir operasyondur.

Token ve oturumların süresi her erişimde veritabanında kontrol edilir.
Operatör, onaylı bakım sürecinde süresi geçmiş müşteri tokenlarını, müşteri ve
misafir oturumlarını temizleyebilir. Sepet birleşim anahtarlarını rastgele
silmeyin: kalıcılık tekrar istek güvenliğinin parçasıdır. Hesap kapatma
sonrasında veri türüne göre saklama/imha incelemesi ve uygulanması işletmenin
ayrı operasyonudur; bu çalışma kanuni saklama süreleri uydurmaz.

## Güvenlik ve davranış

- Şifreler bcrypt maliyet 12 ile hash'lenir. En az 12 karakter ve bcrypt'in
  kesilmesini önlemek için en fazla 72 UTF-8 bayt kabul edilir.
- Doğrulama/sıfırlama/e-posta değişimi tokenları 32 rastgele bayt, SHA-256
  hash kaydı, 30 dakika süre ve tek kullanımla sınırlıdır. Bağlantıda URL
  fragment kullanılır; fragment sunucu isteği/referrer/access log'a gitmez,
  sayfa açılınca adres çubuğundan çıkarılır. GET tokenı tüketmez; kullanıcı
  form POST'u ile tamamlar. Ön kayıtla hesap ele geçirmeyi önlemek için
  doğrulamada kayıt şifresi gerekir. Unutulduysa güvenli sıfırlama akışı
  e-posta sahipliğini doğrulayarak yeni şifre belirler.
- Rastgele müşteri oturumunun sadece hash'i DB'dedir; HttpOnly,
  SameSite=Lax ve HTTPS'te Secure çerez 7 gün geçerlidir. Müşteri çerezi
  admin API'sine, admin çerezi müşteri API'sine yetki sağlamaz.
- Şifre değişimi diğer oturumları ve açık tokenları iptal eder; sıfırlama ve
  e-posta doğrulaması tüm müşteri oturumlarını iptal eder. E-posta değişimi
  önce mevcut şifreyi, sonra yeni e-postadaki tek kullanımlık bağlantıyı ister.
- Mutasyonlar Origin denetimi, boyut sınırı, Zod doğrulaması ve DB tabanlı
  deneme sınırı kullanır. Kimlik varlığını bildiren giriş/kayıt/sıfırlama
  cevapları yoktur. Hata mesajları DB/provider ayrıntısı içermez.
- Adres, sepet ve sipariş sorguları sunucudaki kimliğe bağlıdır. İstemcinin
  gönderdiği kullanıcı kimliği erişim yetkisi değildir. Kritik yazmalar
  hesap/oturum sürümünü transaction kilidi altında yeniden kontrol eder.
- Misafir sepeti girişten sonra kalıcı işlem anahtarıyla bir kez birleşir;
  aynı varyant miktarları toplanır, 99 ile sınırlanır. Farklı ölçü/parça/saat/
  rakamlar ayrı kalır. Hesap sepeti localStorage'a yazılmaz. Hesap değişiminde
  eski sepet yazmaları sahiplik ve sürüm kontrolüyle engellenir. Aynı anda
  değişen sepet eski sürümle ezilmez; kullanıcı güncel sepeti yeniden yükler.
- Fiyat/indirim/uygunluk/kargo mevcut sunucu checkout hesabından gelir;
  hesap sepetindeki başlık ve görseller fiyat veya ürün kanıtı değildir.
  Sadece özel ölçü m² hesabı kullanır; standart ürün satıcı fiyatını korur.
- Doğrulanmış gerçek callback hesap sepetinden alınan adetleri aynı transaction'da
  bir kez düşer. Test callback'i sepeti tüketmez veya sevkiyat başlatmaz.
- Yeni müşteri siparişi kimliğe bağlanır. Eski misafir siparişi için hem
  sipariş e-postasına gelen erişim kanıtı hem aynı doğrulanmış e-postalı
  müşteri oturumu gerekir. Başarılı bağlama eski misafir erişimlerini kaldırır.
- İptal/iade/destek başvurusu ve mesajları tekrar anahtarlarıyla korunur.
  Durumlar doğrulanıp geçmişe kaydedilir. Başvurunun uygun bulunması para
  iadesi ya da sipariş iptali değildir. Para iadesi otomasyonu eklenmedi.
- Kargo bilgileri admin'in kaydıdır; canlı taşıyıcı entegrasyonu yoktur.
  Fatura dosyası/entegrasyonu yoksa belge oluşturulmaz veya indirme sunulmaz.
  Fatura için ad soyad ve adres tutulur; teyit edilmemiş şirket/TCKN/vergi
  alanları istenmez. İşletmenin kurumsal fatura gereksinimi ayrıca belirlenmeli.

## Test ve kabul

```sh
pnpm test:customer
pnpm test:customer:email
pnpm typecheck
# Build sırasında herhangi bir gerçek DB bağlantısını engelleyin.
DATABASE_URL='' CUSTOMER_EMAIL_API_KEY='' CUSTOMER_AUTH_SECRET='' PAYTR_ENABLED=false pnpm build
pnpm test:customer:http
pnpm test:payments:http
pnpm test:admin:http
pnpm test:payments
pnpm test:pricing
pnpm test:admin
pnpm test:legal
pnpm test:artwork
pnpm test:crop
pnpm exec playwright install chromium
pnpm test:customer:browser
```

Müşteri HTTP/tarayıcı testleri yalnızca 127.0.0.1 üzerinde, `work/` içinde
oluşturulan boş PostgreSQL 18 kümesini (`embedded-postgres`) kullanır ve
sonunda siler. İşletmenin DATABASE_URL değerini kullanmaz. Mevcut admin/PayTR
regresyonları geçici PGlite kullanır. Rastgele test şifreleri ve Node preload
ile taklit Resend/PayTR kullanır. E-postalar sadece test belleğinde yakalanır;
uygulamanın mock endpoint'i veya doğrulama bypass'ı yoktur. Gerçek e-posta ve
PayTR ağına istek gönderilmez. Tarayıcı testi ayrı agent-browser oturumu ve
Playwright Chromium kullanır; kullanıcının mevcut tarayıcı oturumuna dokunmaz.
`pnpm dlx agent-browser` ilk çalışmada aracı indirir. `embedded-postgres`
yerel PostgreSQL ikilisinin bağlantılarını hazırlamak için platform paketinin
postinstall scriptini gerektirir. Bu makinede `@embedded-postgres/darwin-arm64`
scripti incelenerek `pnpm-workspace.yaml` içinde izin verildi. Diğer işletim
sistemlerinde kendi platform paketini inceleyip `pnpm approve-builds` ile
onaylayın; testleri normal kullanıcıyla çalıştırın, sistem kullanıcısı oluşturulmaz. Ekran görüntüleri sadece
sentetik verilerle `work/customer-qa/` altında tutulur; Git'e alınmaz.

Testler kayıt/doğrulama/sıfırlama, oturum iptali, adres CRUD/varsayılanları,
eşzamanlı birleşim tekrarları, eski sürüm yazmaları, iki müşteri ve admin
arasında erişim ayrımı, misafir kanıtı/bağlama, snapshot değişmezliği, başvuru
geçişleri, kargo, callback imzası/tekrarı ve test ödeme ayrımını kapsar.
Tarayıcı kabulü 390, 768 ve 1440 px genişlikte hesap/ödeme akışlarını,
klavye girişini ve taşmayı kontrol eder. Gerçek cihaz, Safari/Firefox,
ekran okuyucu, gerçek e-posta teslimatı ve PayTR 3D Secure kabulü ayrıca gerekir.

## Değişen dosya grupları ve dış bağımlılıklar

8 Eylül 2026 doğrulaması: TypeScript ve production build başarılı;
47 birim testi, 85 müşteri HTTP, 48 PayTR HTTP ve 159 admin HTTP kontrolü
geçti. Ayrı tarayıcı oturumunda kayıt/doğrulama, klavye ile giriş,
sepet birleşimi, adres kaydı, ayrı teslimat/fatura adresiyle ödeme,
sipariş desteği ve çıkış sonrası veri ayrımı doğrulandı. Mobil (390 px),
tablet (768 px) ve masaüstü (1440 px) hesap/ödeme ekranlarında yatay taşma
ve React hydration hatası bulunmadı. Hiçbir canlı veritabanı migration'ı,
gerçek e-posta gönderimi, gerçek tahsilat veya deploy yapılmadı.

- `db/004-customer-accounts.sql`, `scripts/customer-migrate.ts`,
  `scripts/admin-setup.ts`: eklemeli veritabanı kurulumu.
- `lib/customer/*`, `lib/http-error.ts`, `app/api/hesap/[action]/route.ts`:
  hesap, token, e-posta, adres, sepet, sahiplik ve satış sonrası veri katmanı.
- `app/profil/*`: mevcut hesabın gerçek işlevleri, yükleme/hata durumları.
- `app/components/cart-provider.tsx`, `app/odeme/*`, `lib/payments/*`:
  kalıcı sepet, adres doldurma ve ödeme/snapshot bağlantısı.
- Admin sipariş ekranı, şema/repository ve API; yeni müşteri işlemleri ekranı:
  takip bilgisi ve başvurular. Header/footer hesabı mevcut URL'ye yönlendirir.
- `.env.example`, `CUSTOMER_ACCOUNTS.md`, `PAYTR.md`, `LEGAL.md`,
  `lib/legal-documents.ts`: gerçek teknik davranış ve kurulum gereksinimleri.
- `tests/customer*`, `tests/fixtures/customer-provider.mjs`, mevcut HTTP test
  migration listeleri, `package.json` ve kilit dosyası: otomatik doğrulama.

Dışarıda tamamlanacaklar: onaylı hedefte migration ve sunucu env kurulumu;
Resend alan adı/teslimat kabulü; mevcut PayTR gerçek test kabulü; fatura
entegrasyonu veya güvenli belge yükleme süreci; kargo işletmesi ve sözleşmesi;
resmi satıcı/veri sorumlusu bilgileri; kargo ücreti ve teslim taahhüdü; kategori
bazlı saklama/imha ve hesap kapatma operasyonu; siparişe özel kalıcı hukuki
belgeler. Bunlar kod tarafından tahmin edilmez ve ödeme canlıya alınmaz.

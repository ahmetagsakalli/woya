import type { LegalSlug } from "./legal";

type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  items?: string[];
};
type LegalDocument = { intro: string; sections: LegalSection[] };

const withdrawal: LegalSection = {
  id: "cayma-hakki",
  title: "Cayma hakkı ve bildirim",
  paragraphs: [
    "Cayma hakkı kapsamındaki ürünlerde, ürünü sizin veya belirlediğiniz kişinin teslim aldığı tarihten itibaren 14 gün içinde gerekçe göstermeden ve cezai şart ödemeden sözleşmeden cayabilirsiniz. Teslimattan önce de bildirim yapabilirsiniz. Tek siparişte ayrı teslim edilen ürünlerde süre son ürünün teslimiyle başlar.",
    "Cayma kararınızı aşağıdaki e-posta veya posta adresine yazılı olarak iletebilirsiniz. Sipariş numarası, adınız, iletişim bilginiz, ilgili ürün ve cayma kararınızı belirtmeniz işlemin bulunmasını kolaylaştırır. Belirli bir form kullanmanız ya da telefonla ön onay almanız şart değildir. Bildiriminizi ve gönderim kaydını saklayın.",
  ],
};
const returns: LegalSection = {
  id: "iade",
  title: "Ürünün geri gönderilmesi ve bedel iadesi",
  paragraphs: [
    "Satıcı ürünü kendisi almayı teklif etmedikçe, cayma bildiriminizden itibaren 14 gün içinde ürünü geri gönderin. Cam ve aynalı parçaları taşımada zarar görmeyecek şekilde koruyun; varsa birlikte teslim edilen aksesuarları da ekleyin. Sırf ambalajın açılmış olması cayma hakkını ortadan kaldırmaz.",
    "Ön bilgilendirmede belirtilen taşıyıcıyla iadede kargo masrafı tüketiciye yüklenmez. İade taşıyıcısı belirtilmemişse herhangi bir taşıyıcıyla iadede de tüketiciden iade masrafı istenmez. Belirtilen taşıyıcının bulunduğunuz yerde şubesi yoksa ürün ek masraf olmaksızın alınır.",
    "Teslimat bedeli dahil geri ödemeler, belirtilen taşıyıcıya teslimden itibaren 14 gün içinde; farklı taşıyıcı tercih edildiğinde ürünün satıcıya ulaşmasından itibaren 14 gün içinde yapılır. Teslim edilmemiş üründe süre cayma bildirimiyle başlar. İade, kullanılan ödeme aracına uygun biçimde, tek seferde ve ek ücret alınmadan yapılır.",
  ],
};
const custom: LegalSection = {
  id: "ozel-uretim",
  title: "Özel ölçü ve kişiye özel üretim",
  paragraphs: [
    "Yalnızca sizin isteğinize veya kişisel ihtiyacınıza göre hazırlanan, örneğin kişiye özel ölçüde üretilen ya da size ait görselle basılan mallar, Mesafeli Sözleşmeler Yönetmeliği uyarınca cayma hakkı istisnasına girebilir. Bu nitelik siparişten önce açıkça belirtilmelidir.",
    "Bir ürünün tablo, saat veya set olması tek başına iade hakkını kaldırmaz. Katalogdaki standart seçeneklerden seçim yapılması da otomatik olarak kişiye özel üretim sayılmaz. Özel üretim istisnası, ayıplı, yanlış veya eksik ürün teslimine ilişkin yasal haklarınızı ortadan kaldırmaz.",
  ],
};
const disputes: LegalSection = {
  id: "basvuru",
  title: "Destek ve uyuşmazlıklar",
  paragraphs: [
    "Siparişinizle ilgili bildirim ve şikayetlerinizi aşağıdaki WOYA iletişim kanallarına iletebilirsiniz. Sipariş numarası ve sorunun açıklaması incelemeyi kolaylaştırır; kart numarası, CVV veya banka şifresi paylaşmayın.",
    "6502 sayılı Kanundan doğan haklarınız saklıdır. Uyuşmazlığın niteliği ve başvuru yılındaki parasal sınırlar çerçevesinde, yerleşim yerinizde veya işlemin yapıldığı yerde tüketici hakem heyetine ya da tüketici mahkemesine başvurabilirsiniz. Kanunen gerekli hallerde dava öncesi arabuluculuk hükümleri uygulanır.",
  ],
};

export const legalDocuments: Record<LegalSlug, LegalDocument> = {
  "on-bilgilendirme-formu": {
    intro:
      "WOYA üzerinden tablo, dekoratif saat ve set satın almadan önce ürün özellikleri, fiyatlandırma, teslimat ve tüketici haklarına ilişkin bu bilgileri inceleyebilirsiniz. Bu genel metin, alıcı ve sipariş bilgileri doldurulmuş işlem özelindeki ön bilgilendirmenin yerine geçmez.",
    sections: [
      {
        id: "urun",
        title: "Ürün ve sipariş bilgileri",
        paragraphs: [
          "Ürünün adı, görselleri, malzemesi ve sunulan seçenekleri ilgili ürün sayfasında yer alır. Kendin Oluştur alanında seçilen sağ ve sol tablo, saat modeli, rakam tasarımı ve ölçüler sipariş seçiminizi oluşturur. Siparişi tamamlamadan önce model, adet, ölçü ve teslimat bilgilerinizi kontrol edin.",
          "Dekorasyon görsellerindeki mobilya ve aksesuarlar, ürün açıklamasında ayrıca belirtilmedikçe satışa dahil değildir. Görseldeki ölçek yerine belirtilen santimetre ölçülerini esas alın. Bu açıklama, ürünün ilan edilen niteliklerine uygun teslim edilmesi yükümlülüğünü sınırlamaz.",
        ],
      },
      {
        id: "fiyat",
        title: "Fiyat ve özel ölçü hesabı",
        paragraphs: [
          "Standart ölçülerde ürün için ilan edilen satış fiyatı uygulanır; bütün ürünler metrekare üzerinden fiyatlandırılmaz. Özel ölçü seçildiğinde, seçilen parçaların alanları ilgili metrekare birim fiyatlarıyla hesaplanır. Setlerde birden fazla parçanın bedeli toplamda dikkate alınır.",
          "Dikdörtgen parça alanı, santimetre cinsinden en × boy / 10.000 ile bulunur. Yuvarlak saatte alan, metre cinsinden yarıçapın karesi × π ile hesaplanır. Uygulanacak toplam ürün bedeli, adet ve varsa indirim sipariş özetinde gösterilir. Onaylanan sipariş bedeli, daha sonra birim fiyat değiştirilerek artırılmaz.",
          "Tüm vergiler dahil ürün bedeli, varsa kargo ve diğer ek masraflar ödeme öncesinde açıkça bildirilmelidir. Kargo ücreti belirtilmeden sipariş için sonradan belirsiz bir bedel talep edilmez. Ücretsiz kargo koşulları ve varsa gönderim kısıtlamaları sipariş anındaki bilgilendirmeye tabidir.",
        ],
      },
      {
        id: "odeme",
        title: "Ödeme",
        paragraphs: [
          "Çevrimiçi ödeme sunulduğunda kart işlemi PayTR ödeme ekranında gerçekleştirilir. Kart numarası ve CVV, WOYA sipariş formunda istenmez. Kullanılabilir ödeme seçenekleri ve toplam tahsilat tutarı işlem öncesinde gösterilir.",
          "Sepete ürün eklemek veya ödeme ekranını açmak, ödemenin gerçekleştiği anlamına gelmez. İşlemin sonucu ödeme kuruluşundan doğrulanır. Başarısız veya bekleyen bir işlem için yeniden ödeme yapmadan önce sipariş durumunu kontrol edin ve gerektiğinde bizimle iletişime geçin.",
        ],
      },
      {
        id: "teslimat",
        title: "Üretim ve teslimat",
        paragraphs: [
          "Ürün siparişte belirtilen alıcıya ve adrese gönderilir. Hazırlık ve teslimat taahhüdü, ürünün standart veya özel üretim niteliğine göre sipariş öncesinde bildirilmelidir. Standart mal satışlarında taahhüt edilen süre her durumda yasal 30 günlük üst sınır içinde olmalıdır. Kişisel istek doğrultusunda hazırlanan mallarda daha uzun süre ayrıca kararlaştırılabilir.",
          "Teslimin imkansızlaşması halinde tüketici 3 gün içinde bilgilendirilir; tahsil edilen bedeller, teslimat masraflarıyla birlikte bildirimden itibaren en geç 14 gün içinde geri ödenir. Ürünün stokta bulunmaması tek başına imkansızlık sayılmaz.",
        ],
      },
      withdrawal,
      returns,
      custom,
      disputes,
    ],
  },
  "mesafeli-satis-sozlesmesi": {
    intro:
      "Bu metin, WOYA mağazasındaki tüketici alışverişlerinin genel satış koşullarını düzenler. Satıcının resmi kimliği ile alıcının bilgileri, ürün seçimi, toplam bedel ve teslimat taahhüdünü içeren siparişe özel belgeyle birlikte değerlendirilmelidir.",
    sections: [
      {
        id: "taraflar",
        title: "Taraflar ve kapsam",
        paragraphs: [
          "Bu metinde alıcı, ticari veya mesleki olmayan amaçlarla alışveriş yapan tüketiciyi; satıcı, WOYA markası altında ürünü satışa sunan işletmeyi ifade eder. WOYA marka adıdır. Satıcının resmi ticaret unvanı ve zorunlu sicil bilgileri sözleşme kurulmadan önce ayrıca açıklanmalıdır. Mağazanın iletişim bilgileri bu sayfanın sonunda yer alır.",
          "Sözleşmenin konusu, alıcının seçtiği tablo, saat veya setin açıklanan özellik ve bedelle teslimidir. Ürün sayfasındaki nitelikler, onaylanan seçenekler, ön bilgilendirme ve sipariş özeti birlikte esas alınır. Emredici tüketici mevzuatına aykırı bir hüküm tüketicinin haklarını sınırlamak için kullanılamaz.",
        ],
      },
      {
        id: "siparis",
        title: "Siparişin kurulması ve bedel",
        paragraphs: [
          "Alıcı, sipariş vermeden önce seçtiği ürünleri, adetleri, standart veya özel ölçüleri, teslimat adresini ve toplam tutarı inceleme imkanına sahip olmalıdır. Ödeme yükümlülüğü doğuran son onaydan önce ön bilgilendirme sunulur. Yalnızca sepet oluşturulması satın alma veya tahsilat anlamına gelmez.",
          "Standart ürünlerde satıcının ilan ettiği fiyat; özel ölçülerde seçilen parçaların alanı ve ilgili metrekare fiyatına göre hesaplanan bedel uygulanır. Ürün bedeli, vergiler, varsa indirim ve kargo ayrı ayrı anlaşılabilir olmalıdır. Onaysız ek hizmet veya bedel eklenmez.",
          "Ödeme hizmeti aktif olduğunda kart bilgileri PayTR ekranına girilir. WOYA ödeme durumunu doğrulayan bildirime göre işlem yapar; tarayıcıda sonuç sayfasına yönlenmek tek başına ödeme kanıtı değildir. Taksit varsa koşulları ve toplam bedeli ödeme ekranında açıklanır.",
        ],
      },
      {
        id: "teslim",
        title: "Teslim, hasar ve gecikme",
        paragraphs: [
          "Satıcı ürünü, onaylanan niteliklere uygun ve güvenli taşımaya elverişli biçimde hazırlamakla yükümlüdür. Ürün açıklamasında bulunmayan montaj, duvara asma veya dekorasyon hizmetleri satışa dahil kabul edilmez; ayrıca sunuluyorsa kapsamı ve bedeli siparişten önce belirtilir.",
          "Ön bilgilendirmede belirtilen taşıyıcı kullanıldığında, ürün tüketiciye teslim edilene kadar kayıp ve hasar riski satıcıya aittir. Hasar görürseniz fotoğraf ve taşıma kaydıyla bizimle iletişim kurmanız incelemeye yardımcı olur. Tutanak bulunmaması tüketicinin yasal haklarını kendiliğinden ortadan kaldırmaz.",
          "Standart ürünler taahhüt edilen süre içinde ve yasal 30 günlük üst sınırı aşmadan teslim edilmelidir. Kişiye özel üretimde farklı süre açıkça kararlaştırılabilir. Taahhüdün yerine getirilmemesi halinde tüketicinin sözleşmeyi fesih ve mevzuata uygun geri ödeme hakları saklıdır.",
        ],
      },
      custom,
      withdrawal,
      returns,
      {
        id: "ayipli-urun",
        title: "Yanlış, eksik veya ayıplı ürün",
        paragraphs: [
          "Ürün siparişteki modelden veya ölçüden farklıysa, eksik gönderilmişse ya da ayıplıysa WOYA ile iletişime geçebilirsiniz. Tüketici; yasal şartları çerçevesinde sözleşmeden dönme, bedel indirimi, ücretsiz onarım veya ayıpsız misliyle değişim haklarından yararlanabilir. İlgili masraflar mevzuata göre sorumlu tarafa aittir.",
          "Cayma süresinin sona ermesi, kişiye özel üretim yapılması veya ürünün indirimli olması ayıplı mala ilişkin hakları ortadan kaldırmaz. Ekran rengi, doğal malzeme veya üretim tekniği açıklamaları, ilan edilen ürün yerine farklı ya da kusurlu ürün teslimini haklı kılmaz.",
        ],
      },
      {
        id: "kayitlar",
        title: "Bildirimler ve kayıtlar",
        paragraphs: [
          "Tarafların siparişe ilişkin yazışmaları, seçilen ürün ve ölçüler, ödeme kayıtları ve ön bilgilendirme kayıtları işlemin değerlendirilmesinde kullanılabilir. Bu kayıtlar, tüketicinin başka yasal deliller sunmasını engelleyen kesin delil şartı oluşturmaz.",
          "Bu genel metindeki sonraki değişiklikler, kurulmuş bir sözleşmenin bedelini ve koşullarını tüketici aleyhine kendiliğinden değiştirmez. Kişisel verilerin işlenmesine ilişkin bilgiler, Kişisel veriler ve gizlilik sayfasında ayrıca açıklanır; satış koşullarını kabul etmek reklam izni vermek anlamına gelmez.",
        ],
      },
      disputes,
    ],
  },
  "kisisel-veriler-ve-gizlilik": {
    intro:
      "Bu açıklama, WOYA mağazasını ziyaret ederken, ürün seçerken, sipariş işlemi yaparken veya bizimle iletişim kurarken kullanılan kişisel verilere ilişkindir. Bir pazarlama izni veya açık rıza metni değildir.",
    sections: [
      {
        id: "sorumlu",
        title: "Kapsam ve iletişim",
        paragraphs: [
          "WOYA markası altında yürütülen mağaza işlemleriyle ilgili başvurularınızı bu sayfanın sonundaki iletişim bilgileri üzerinden iletebilirsiniz. Veri sorumlusu, markayı işleten gerçek veya tüzel kişidir; marka adı tek başına resmi veri sorumlusu kimliğinin yerine geçmez.",
        ],
      },
      {
        id: "veriler",
        title: "Hangi bilgiler kullanılır?",
        paragraphs: [
          "Sipariş formuna girdiğiniz ad ve soyad, e-posta, telefon, teslimat adresi ve sipariş notu; seçilen ürünler, adetler, ölçüler ve tasarım seçenekleri sipariş kaydına dahil edilir. Ödeme sürecinde işlem referansı, tutar, işlem sonucu ve onay zamanı gibi kayıtlar tutulur.",
          "Bağlantı ve güvenlik işlemlerinde IP bilgisi, istek ve hata kayıtları ile rastgele oturum tanımlayıcıları işlenebilir. Sepet seçiminiz tarayıcınızda saklanır. Bize e-posta, telefon veya WhatsApp üzerinden ulaşırsanız ilettiğiniz mesaj ve iletişim bilgileriniz de talebinizin ele alınması için kullanılır.",
          "WOYA ödeme formu kart numarası, son kullanma tarihi veya CVV toplamaz. PayTR ödeme ekranı kullanıldığında bu bilgiler doğrudan ödeme kuruluşuna girilir. Destek mesajlarına kart bilgisi, banka şifresi veya gereksiz özel nitelikli kişisel veri eklemeyin.",
        ],
      },
      {
        id: "amac",
        title: "Amaçlar ve hukuki sebepler",
        paragraphs: [
          "Sipariş, adres ve iletişim bilgileri; satın alma işleminin kurulması, ürünün hazırlanması, teslimi, ödeme ve iade süreçlerinin yürütülmesi için, KVKK madde 5/2-c kapsamındaki sözleşmenin kurulması veya ifası şartına dayanılarak kullanılır.",
          "Fatura ve ilgili işlem kayıtları, uygulanabilir mevzuatın gerektirdiği ölçüde madde 5/2-a ve 5/2-ç kapsamındaki kanuni düzenleme ve hukuki yükümlülükler için; uyuşmazlık kayıtları madde 5/2-e kapsamında bir hakkın tesisi, kullanılması veya korunması için işlenir.",
          "Yetkisiz erişimi ve kötüye kullanımı önlemeye yönelik sınırlı teknik kayıtlar, temel hak ve özgürlüklerinize zarar vermemek kaydıyla madde 5/2-f kapsamındaki meşru menfaat şartıyla değerlendirilir. Ayrı izin gerektiren bir pazarlama faaliyeti, sipariş vermenin zorunlu koşulu olarak sunulmaz.",
        ],
      },
      {
        id: "aktarim",
        title: "Hizmet sağlayıcılar ve veri aktarımı",
        paragraphs: [
          "Ödeme başlatıldığında ad, iletişim ve teslimat bilgileri, sepet dökümü, tutar ve IP bilgisi PayTR ile ödeme işleminin yürütülmesi ve güvenliği amacıyla paylaşılır. Teslimat için gerekli alıcı, adres ve telefon bilgileri gönderiyi taşıyan kargo işletmesine iletilir. Yetkili kamu kurumlarına yalnızca hukuki yükümlülük kapsamında bilgi verilir.",
          "Barındırma ve veritabanı hizmetleri, sipariş kayıtları ve sitenin sunulması için teknik altyapı sağlar. Hizmetin konumu veya yurt dışından erişim biçimi yurt dışına veri aktarımı doğurabilir; böyle bir aktarımda KVKK madde 9 şartlarının ayrıca sağlanması gerekir. Bu metni görüntülemek yurt dışı aktarım için açık rıza vermek değildir.",
          "Sayfalardaki Google Haritalar içeriği yüklendiğinde tarayıcı Google sunucularına bağlanır. WhatsApp ve Instagram bağlantıları ise sizi ilgili sağlayıcının hizmetine götürür. Bu hizmetlerin kendi veri işleme koşulları ayrıca geçerlidir.",
        ],
      },
      {
        id: "saklama",
        title: "Saklama ve güvenlik",
        paragraphs: [
          "Sipariş ve ödeme kayıtları, işlem ve uyuşmazlıkların takibi ile uygulanabilir yasal saklama yükümlülükleri için tutulur. Farklı veri türlerinin saklama gereksinimleri aynı değildir; tarayıcı verilerini silmek sunucudaki sipariş kaydını silmez. Silme talepleri, devam eden hukuki saklama zorunlulukları dikkate alınarak değerlendirilir.",
          "Yönetim paneli yetkilendirme ile korunur; oturum çerezlerine tarayıcı betiklerinin erişimi kapalıdır. Ödeme sonucu sunucuda doğrulanır ve gizli ödeme anahtarları tarayıcıya gönderilmez. İnternet üzerinden hiçbir aktarım için mutlak güvenlik garantisi verilemez.",
        ],
      },
      {
        id: "haklar",
        title: "Haklarınız ve başvuru",
        paragraphs: [
          "KVKK madde 11 uyarınca verilerinizin işlenip işlenmediğini öğrenebilir; işlenmişse bilgi, amaç ve amaca uygun kullanım hakkında açıklama isteyebilir; yurt içi veya yurt dışındaki alıcıları öğrenebilirsiniz. Eksik veya yanlış verilerin düzeltilmesini, yasal şartları varsa silinmesini veya yok edilmesini ve bu işlemlerin alıcılara bildirilmesini talep edebilirsiniz.",
          "Yalnızca otomatik analiz nedeniyle aleyhinize çıkan sonuca itiraz etme ve hukuka aykırı işleme nedeniyle zararınızın giderilmesini isteme hakkınız vardır. Başvurunuzu yazılı olarak adresimize veya mevzuata uygun elektronik yöntemle iletebilirsiniz. Daha önce bildirdiğiniz ve sistemimizde kayıtlı e-postanızı kullanmanız kimliğin doğrulanmasına yardımcı olur.",
          "Başvuruda adınız, soyadınız, talebiniz ve yanıt için iletişim bilginiz bulunmalıdır; mevzuatın gerektirdiği kimlik doğrulaması güvenli yöntemle yapılır. Kimlik belgesi veya hassas bilgiyi sıradan bir destek mesajına eklemeyin. Başvurular en geç 30 gün içinde sonuçlandırılır; Kurula şikayet hakkınız saklıdır.",
        ],
      },
    ],
  },
  "cerez-politikasi": {
    intro:
      "WOYA, sepetinizi korumak ve güvenli oturum işlemlerini yürütmek için tarayıcı depolamasından yararlanır. Aşağıda mağazanın kendi çerezleri ile çerez olmayan yerel depolama kayıtları ayrı ayrı açıklanmıştır.",
    sections: [
      {
        id: "tanim",
        title: "Çerez ve yerel depolama",
        paragraphs: [
          "Çerezler tarayıcıda tutulan ve ilgili siteye yapılan isteklerde iletilebilen küçük kayıtlardır. Yerel depolama (localStorage) ise tarayıcıda saklanan, her istekte kendiliğinden gönderilmeyen ayrı bir teknolojidir. Her iki türü de tarayıcınızın site verileri ayarlarından silebilirsiniz.",
        ],
      },
      {
        id: "envanter",
        title: "WOYA tarafından kullanılan kayıtlar",
        paragraphs: [
          "Bu kayıtlar reklam hedeflemek için değil, sepet ve işlem güvenliği için kullanılır. Yönetici çerezi yalnızca yönetim panelinde oturum açıldığında oluşur; ödeme çerezi ödeme akışında oluşturulur.",
        ],
        items: [
          "woya-cart-v1 · Yerel depolama. Ürünleri, adetleri ve tasarım/ölçü seçimlerini saklar. Sabit bir son kullanma süresi yoktur; sepet işlemleriyle güncellenir veya tarayıcıdaki site verileri silindiğinde kaldırılır.",
          "woya-purchased:<sipariş referansı> · Yerel depolama. Tamamlanan ödemenin sepetten iki kez düşülmesini önleyen işaret kaydıdır. Sabit süreyle kendiliğinden silinmez; site verileri temizlendiğinde kaldırılır.",
          "woya-checkout · Birinci taraf çerezi. Ödeme ekranı ve işlem sonucuna ilgili tarayıcının erişimini doğrular. Süresi 7 gündür; rastgele bir tanımlayıcı içerir. HttpOnly ve SameSite=Lax niteliklerini, HTTPS bağlantıda Secure niteliğini kullanır.",
          "woya-admin-session · Birinci taraf çerezi. Yönetici kimlik doğrulaması içindir; süresi 8 saattir. HttpOnly ve SameSite=Strict niteliklerini, üretim ortamında Secure niteliğini kullanır. Çıkışta temizlenir; şifre değişikliği sunucudaki oturum yetkisini geçersiz kılar.",
        ],
      },
      {
        id: "ucuncu-taraf",
        title: "Harita, ödeme ve dış bağlantılar",
        paragraphs: [
          "Google Haritalar gömülü içeriği yüklendiğinde Google ile bağlantı kurulur; IP ve tarayıcı bilgileri ilgili sağlayıcıya iletilebilir ve sağlayıcı kendi çerezlerini kullanabilir. Sayfadaki haritanın yüklenmesi yalnızca harita bağlantısına tıklamaya bağlı değildir.",
          "PayTR ödeme ekranı açıldığında ödeme sağlayıcısının oturum ve güvenlik teknolojileri devreye girebilir. Bu üçüncü taraf kayıtlarının süre ve kapsamı sağlayıcının güncel koşullarına bağlıdır. WOYA'nın yukarıdaki süreleri üçüncü taraf çerezleri için geçerli değildir.",
          "Mağazanın kendi kodunda reklam pikseli veya ziyaretçi analitiği aracı etkin değildir. Instagram ve WhatsApp bağlantıları ilgili dış hizmete yönlendirir. Dış hizmetlerin çerez ve gizlilik koşullarını ayrıca inceleyebilirsiniz.",
        ],
      },
      {
        id: "kontrol",
        title: "Tercihleriniz",
        paragraphs: [
          "Tarayıcınızın gizlilik ayarlarından çerezleri, üçüncü taraf çerezlerini ve site verilerini yönetebilirsiniz. Sepet kaydını silmek seçimlerinizi kaldırır. Ödeme çerezini engellemek veya silmek ödeme ekranına ya da işlem sonucuna erişimi; yönetici çerezini engellemek panele girişi etkileyebilir.",
          "Siteyi ziyaret etmek veya bu metni okumak, zorunlu olmayan çerezler için rıza verdiğiniz anlamına gelmez. Kişisel verilerinizle ilgili taleplerinizi aşağıdaki iletişim bilgilerine iletebilir; ayrıntıları Kişisel veriler ve gizlilik sayfasından inceleyebilirsiniz.",
        ],
      },
    ],
  },
};

import type { SiteContent } from "./admin/schema";

export const legalUpdatedAt = "2026-09-08";
export const legalContact = {
  address: "Yakuplu, 120. Sk. No:18, 34524 Beylikdüzü/İstanbul, Türkiye",
  email: "info@woya.com.tr",
};

export const legalPages = [
  {
    slug: "on-bilgilendirme-formu",
    title: "Ön bilgilendirme formu",
    description:
      "WOYA alışverişlerinde ürün, fiyat, ödeme, teslimat ve cayma hakkına ilişkin ön bilgiler.",
  },
  {
    slug: "mesafeli-satis-sozlesmesi",
    title: "Mesafeli satış sözleşmesi",
    description:
      "WOYA tablo ve saat alışverişlerinde satış, teslimat, özel üretim ve iade koşulları.",
  },
  {
    slug: "kisisel-veriler-ve-gizlilik",
    title: "Kişisel veriler ve gizlilik",
    description:
      "WOYA mağazasında kişisel verilerin kullanımı, korunması ve başvuru hakları.",
  },
  {
    slug: "cerez-politikasi",
    title: "Çerez politikası",
    description:
      "WOYA mağazasındaki çerezler, yerel depolama, kullanım amaçları ve saklama süreleri.",
  },
] as const;
export type LegalSlug = (typeof legalPages)[number]["slug"];
export const legalHref = (slug: LegalSlug) => `/yasal/${slug}`;
export const legalFooterLinks = legalPages.map((page) => ({
  label: page.title,
  href: legalHref(page.slug),
  group: "Yasal" as const,
}));

// Existing databases still contain the original contact-page placeholders.
// Preserve independently edited links and nonempty contact details.
export function resolveLegalContent(content: SiteContent): SiteContent {
  return {
    ...content,
    address: content.address.trim() || legalContact.address,
    email: content.email.trim() || legalContact.email,
    footerLinks: content.footerLinks.map((link) => {
      const replacement = legalFooterLinks.find(
        (item) => item.label === link.label,
      );
      return replacement &&
        link.group === "Yasal" &&
        ["/iletisim", "/#iletisim", "#iletisim"].includes(link.href)
        ? { ...link, href: replacement.href }
        : link;
    }),
  };
}

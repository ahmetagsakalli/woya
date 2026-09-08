"use client";

import type { FormEvent } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";

type SearchItem = {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  keywords: string;
};

const searchItems: SearchItem[] = [
  {
    eyebrow: "Bölüm",
    title: "Tüm Ürünler",
    text: "WOYA tablo ve saat ürün kataloğunu inceleyin.",
    href: "/urunler",
    keywords: "tüm ürünler katalog ürünler woya tablo saat",
  },
  {
    eyebrow: "Bölüm",
    title: "Koleksiyon",
    text: "Tablo, saat ve dekoratif duvar ürünlerinden oluşan WOYA koleksiyonunu inceleyin.",
    href: "/koleksiyon",
    keywords: "koleksiyon ürünler tablo saat dekorasyon",
  },
  {
    eyebrow: "Bölüm",
    title: "Kişiye Özel Tasarım",
    text: "WOYA parçalarıyla model ve rakam tercihlerinizi kişiselleştirin.",
    href: "/#kendi-tasariminiz",
    keywords:
      "kişiye özel kendi tasarım yükle görsel sipariş özel tablo özel saat",
  },
  {
    eyebrow: "Favori",
    title: "Lüks Saat Setleri",
    text: "Altın detaylı tablo ve saat kompozisyonları.",
    href: "/saatler",
    keywords: "lüks saat set altın dekoratif saat",
  },
  {
    eyebrow: "Favori",
    title: "Cam Tablo & Saat",
    text: "Parlak yüzeyli, bütünlüklü dekoratif setler.",
    href: "/koleksiyon",
    keywords: "cam tablo saat set parlak yüzey",
  },
  {
    eyebrow: "Favori",
    title: "Çiçek Tabloları",
    text: "Mekâna göre zarif ve dengeli sanat vurgusu.",
    href: "/tablolar",
    keywords: "çiçek tablo cicek modern tablo dekoratif",
  },
  {
    eyebrow: "Ürün",
    title: "Beyaz Manolya Duvar Saati Seti",
    text: "Açık tonlu çiçek panelleri ve gold detaylı saat.",
    href: "/urunler/beyaz-manolya-duvar-saati-seti",
    keywords: "beyaz manolya çiçek tablo saat set gold",
  },
  {
    eyebrow: "Ürün",
    title: "Siyah Gold Yaprak Duvar Saati Seti",
    text: "Siyah zemin üzerinde gold yaprak vurgulu set.",
    href: "/urunler/siyah-gold-yaprak-duvar-saati-seti",
    keywords: "siyah gold yaprak tablo saat set",
  },
  {
    eyebrow: "Ürün",
    title: "Yuvarlak Ayna Saat Seti",
    text: "Yuvarlak ayna etkili saat ve yan aplikler.",
    href: "/urunler/yuvarlak-ayna-saat-seti",
    keywords: "ayna saat set yuvarlak dekoratif",
  },
  {
    eyebrow: "Kurumsal",
    title: "WOYA",
    text: "WOYA'nın tablo ve saat koleksiyonlarına yaklaşımını ve iletişim bilgilerini inceleyin.",
    href: "/hakkimizda",
    keywords: "hakkımızda firma woya tablo saat marka",
  },
  {
    eyebrow: "Destek",
    title: "Muhtemelen Merak Ediyorsunuz",
    text: "Ürün, ölçü, teslimat ve sipariş süreci hakkında sık sorulan sorular.",
    href: "/sss",
    keywords: "sıkça sorulan sorular sss teslimat ölçü sipariş",
  },
  {
    eyebrow: "İletişim",
    title: "İletişim ve Konum",
    text: "Telefon, Instagram ve konum bilgilerine ulaşın.",
    href: "/iletisim",
    keywords: "iletişim telefon instagram konum adres",
  },
];

function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ç", "c")
    .replaceAll("ğ", "g")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ş", "s")
    .replaceAll("ü", "u");
}

export function SiteSearch({
  products = [],
}: {
  products?: { title: string; text: string; slug: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const resultsId = `${inputId}-results`;
  const normalizedQuery = normalizeSearch(query.trim());

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return [
      ...products.map((p) => ({
        eyebrow: "Ürün",
        title: p.title,
        text: p.text,
        href: `/urunler/${p.slug}`,
        keywords: p.title,
      })),
      ...searchItems.filter(
        (i) => i.eyebrow !== "Ürün" && i.eyebrow !== "Favori",
      ),
    ]
      .filter((item) => {
        const target = normalizeSearch(
          `${item.eyebrow} ${item.title} ${item.text} ${item.keywords}`,
        );
        return target.includes(normalizedQuery);
      })
      .slice(0, 1);
  }, [normalizedQuery, products]);

  const primaryResult = results[0];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    inputRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSearch();
        triggerRef.current?.focus();
      }
    }

    function closeOnOutsideClick(event: PointerEvent) {
      if (!searchRef.current?.contains(event.target as Node)) {
        closeSearch();
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [isOpen]);

  function closeSearch() {
    setIsOpen(false);
    setQuery("");
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (primaryResult) {
      window.location.href = primaryResult.href;
      closeSearch();
    }
  }

  return (
    <div
      className="site-search"
      data-open={isOpen ? "true" : undefined}
      ref={searchRef}
    >
      <button
        className="header-icon-link search-trigger"
        ref={triggerRef}
        type="button"
        aria-label="Site içi arama"
        aria-expanded={isOpen}
        aria-controls={resultsId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Search aria-hidden="true" size={21} strokeWidth={2.6} />
      </button>

      {isOpen ? (
        <form className="inline-search" role="search" onSubmit={submitSearch}>
          <label className="inline-search-field">
            <Search aria-hidden="true" size={18} strokeWidth={2.5} />
            <span className="sr-only">Arama terimi</span>
            <input
              id={inputId}
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tablo, saat, özel tasarım..."
              autoComplete="off"
              aria-controls={resultsId}
            />
          </label>

          {normalizedQuery && primaryResult ? (
            <a
              className="inline-search-hit"
              href={primaryResult.href}
              id={resultsId}
              onClick={closeSearch}
            >
              <span>{primaryResult.title}</span>
              <ArrowUpRight aria-hidden="true" size={14} />
            </a>
          ) : null}

          {normalizedQuery && !primaryResult ? (
            <span className="inline-search-empty" id={resultsId} role="status">
              Sonuç yok
            </span>
          ) : null}

          <button
            className="inline-search-close"
            type="button"
            aria-label="Aramayı kapat"
            onClick={() => { closeSearch(); triggerRef.current?.focus(); }}
          >
            <X aria-hidden="true" size={16} />
          </button>
        </form>
      ) : null}
    </div>
  );
}

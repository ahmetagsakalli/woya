import type { Metadata, Viewport } from "next";
import { CartProvider } from "./components/cart-provider";
import "./globals.css";
import "./mobile.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://woyatablo.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "WOYA",
  title: {
    default: "WOYA | Tablo ve Saatler",
    template: "%s | WOYA",
  },
  description:
    "WOYA ile yaşam alanlarınız için tablo ve saatler, dekoratif saat, cam tablo ve modern duvar sanatı koleksiyonlarını keşfedin.",
  keywords: [
    "WOYA",
    "tablo ve saatler",
    "dekoratif saat",
    "duvar saati",
    "cam tablo",
    "tablo seti",
    "modern tablo",
    "ev dekorasyonu",
    "İstanbul tablo",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    siteName: "WOYA",
    title: "WOYA | Tablo ve Saatler",
    description:
      "Yaşam alanlarınıza ölçülü ihtişam katan tablo ve saat koleksiyonları.",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "WOYA dekoratif saat ve tablo vitrini",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WOYA | Tablo ve Saatler",
    description:
      "Yaşam alanlarınız için seçkin tablo ve saat koleksiyonları.",
    images: ["/og-image.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#15181c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}

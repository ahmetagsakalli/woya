import type { MetadataRoute } from "next";
import { storefrontProducts } from "@/lib/storefront";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://woyatablo.com";
const staticPages = [
  "/urunler",
  "/koleksiyon",
  "/saatler",
  "/tablolar",
  "/hakkimizda",
  "/iletisim",
  "/sepet",
  "/profil",
  "/sss",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const woyaProducts = await storefrontProducts();
  const lastModified = new Date("2026-09-04");

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...staticPages.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.78,
    })),
    ...woyaProducts.map((product) => ({
      url: `${siteUrl}/urunler/${product.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.72,
    })),
  ];
}

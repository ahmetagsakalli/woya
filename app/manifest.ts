import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WOYA",
    short_name: "WOYA",
    description:
      "Dekoratif saat, cam tablo ve modern duvar sanatı koleksiyonları.",
    lang: "tr",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7f2",
    theme_color: "#2f404c",
    categories: ["shopping", "lifestyle", "design"],
  };
}

import "server-only";
import { z } from "zod";
import { HttpError } from "../admin/auth";

export type TrendyolPage = { content: unknown[]; nextPageToken?: string };
export async function fetchTrendyolProducts(
  page = 0,
  nextPageToken?: string,
): Promise<TrendyolPage> {
  const {
    TRENDYOL_SUPPLIER_ID: id,
    TRENDYOL_API_KEY: key,
    TRENDYOL_API_SECRET: secret,
  } = process.env;
  if (!id || !key || !secret)
    throw new HttpError(503, "Trendyol bağlantı bilgileri henüz tanımlanmadı.");
  if (!/^\d+$/.test(id) || !Number.isInteger(page) || page < 0 || page > 99)
    throw new HttpError(400, "Trendyol sayfa veya satıcı bilgisi geçersiz.");
  const url = new URL(
    `https://apigw.trendyol.com/integration/product/sellers/${id}/products/approved`,
  );
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", "100");
  if (nextPageToken) url.searchParams.set("nextPageToken", nextPageToken);
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
      "User-Agent": `${id} - SelfIntegration`,
      storeFrontCode: "TR",
      "Accept-Language": "tr",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
    redirect: "error",
  });
  if (!response.ok)
    throw new HttpError(
      response.status === 429 ? 429 : 502,
      `Trendyol bağlantısı yanıt vermedi (${response.status}).`,
    );
  // V2 content/variant mapping requires the merchant's actual response before import is enabled.
  return z
    .object({
      content: z.array(z.unknown()),
      nextPageToken: z.string().optional(),
    })
    .parse(await response.json());
}

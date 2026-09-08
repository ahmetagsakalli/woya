import { z } from "zod";
import { checkOrigin, readJson } from "@/lib/admin/auth";
import { failure } from "@/lib/admin/http";
import { storefrontQuoteData } from "@/lib/storefront";
import { quoteItem } from "@/lib/quote";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { items } = z
      .object({
        items: z
          .array(
            z.object({
              slug: z.string().min(1).max(220),
              quantity: z.number().int().min(1).max(99),
              configuration: z.unknown().optional(),
            }),
          )
          .max(50),
      })
      .parse(await readJson(request, 50000));
    // Cart validation always reads live availability and rates, never a display cache.
    const { products, settings } = await storefrontQuoteData();
    return Response.json(
      { quotes: items.map((item) => quoteItem(item, products, settings)) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return failure(e);
  }
}

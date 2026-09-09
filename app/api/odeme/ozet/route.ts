import { z } from "zod";
import {
  checkOrigin,
  readJson,
  rateLimit,
  fingerprint,
} from "@/lib/admin/auth";
import { failure } from "@/lib/admin/http";
import { checkoutItemsSchema } from "@/lib/payments/schema";
import { paymentConfig } from "@/lib/payments/config";
import { checkoutOwner, checkoutQuote } from "@/lib/payments/checkout";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { testMode, terms, information } = paymentConfig();
    await rateLimit(fingerprint(request, "checkout:quote"), 300, 60);
    const { items } = z
      .object({ items: checkoutItemsSchema })
      .strict()
      .parse(await readJson(request, 50000));
    const quote = await checkoutQuote(items);
    await checkoutOwner(true);
    return Response.json(
      { quote, testMode, terms, information },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    return failure(e);
  }
}

import { checkOrigin, readJson } from "@/lib/admin/auth";
import { failure } from "@/lib/admin/http";
import { checkoutSchema } from "@/lib/payments/schema";
import { startPayment } from "@/lib/payments/service";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const input = checkoutSchema.parse(await readJson(request, 60000));
    return Response.json(await startPayment(input, request), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (e) {
    return failure(e);
  }
}

import { failure } from "@/lib/admin/http";
import { readPayment } from "@/lib/payments/service";

export async function GET(request: Request) {
  try {
    return Response.json(
      await readPayment(new URL(request.url).searchParams.get("order") || ""),
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    return failure(e);
  }
}

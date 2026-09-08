import { z } from "zod";
import { checkOrigin, readJson, requireAdmin } from "@/lib/admin/auth";
import { failure } from "@/lib/admin/http";
import { adminRequestUpdate, adminServiceSummary } from "@/lib/customer/orders";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const p = new URL(request.url).searchParams;
    return Response.json(
      await adminServiceSummary(
        p.has("orderId") ? z.uuid().parse(p.get("orderId")) : undefined,
        z.coerce
          .number()
          .int()
          .min(1)
          .max(100000)
          .parse(p.get("page") || 1),
      ),
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const actor = await requireAdmin();
    const input = z
      .object({
        id: z.uuid(),
        version: z.number().int().positive(),
        status: z.enum(["open", "reviewing", "approved", "rejected", "closed"]),
        body: z.string().trim().min(1).max(3000),
        submissionId: z.uuid(),
      })
      .strict()
      .parse(await readJson(request, 15000));
    return Response.json(await adminRequestUpdate(actor, input), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (e) {
    return failure(e);
  }
}

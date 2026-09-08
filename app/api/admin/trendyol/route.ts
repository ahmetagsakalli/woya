import { checkOrigin, rateLimit, requireAdmin } from "@/lib/admin/auth";
import { failure } from "@/lib/admin/http";
import { fetchTrendyolProducts } from "@/lib/integrations/trendyol";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const actor = await requireAdmin();
    await rateLimit(`trendyol:${actor}`, 5, 60);
    const page = await fetchTrendyolProducts();
    return Response.json({
      ok: true,
      count: page.content.length,
      message: "Bağlantı doğrulandı. Ürünler mağazaya aktarılmadı.",
    });
  } catch (e) {
    return failure(e);
  }
}

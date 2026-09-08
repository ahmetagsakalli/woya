import "server-only";
import { ZodError } from "zod";
import { HttpError } from "./auth";
export function failure(error: unknown) {
  if (error instanceof ZodError)
    return Response.json(
      {
        error: "Alanları kontrol edin.",
        fields: error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      },
      { status: 400 },
    );
  if (error instanceof HttpError)
    return Response.json({ error: error.message }, { status: error.status });
  const code = (error as { code?: string })?.code;
  if (code === "23505")
    return Response.json(
      { error: "Bu bağlantı adresi veya kayıt zaten mevcut." },
      { status: 409 },
    );
  if (code === "23503")
    return Response.json(
      { error: "Bu kategori ürünlerde kullanılıyor; önce ürünleri taşıyın." },
      { status: 409 },
    );
  console.error("Admin operation failed", { code: code ?? "unavailable" });
  return Response.json(
    { error: "İşlem tamamlanamadı. Bağlantıyı kontrol edip tekrar deneyin." },
    { status: 503 },
  );
}

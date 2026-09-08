export function POST() {
  return Response.json(
    { error: "Sipariş talebi oluşturma kaldırıldı." },
    { status: 410 },
  );
}

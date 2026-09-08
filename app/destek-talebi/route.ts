import { NextRequest, NextResponse } from "next/server";
import { getContent } from "@/lib/admin/repository";

function field(searchParams: URLSearchParams, key: string) {
  return searchParams.get(key)?.trim() || "Belirtilmedi";
}

export async function GET(request: NextRequest) {
  const content = await getContent();
  const whatsappPhone = content.phone.replace(/\D/g, "");
  const searchParams = request.nextUrl.searchParams;
  const message = [
    "Merhaba WOYA, destek talebi oluşturmak istiyorum.",
    `Ad Soyad: ${field(searchParams, "ad")}`,
    `Telefon: ${field(searchParams, "telefon")}`,
    `Konu: ${field(searchParams, "konu")}`,
    `Mesaj: ${field(searchParams, "mesaj")}`,
  ].join("\n");

  const whatsappUrl = new URL(`https://wa.me/${whatsappPhone}`);
  whatsappUrl.searchParams.set("text", message);

  return NextResponse.redirect(whatsappUrl);
}

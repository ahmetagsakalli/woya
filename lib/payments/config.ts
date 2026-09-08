import "server-only";
import { isIP } from "node:net";
import { HttpError } from "../admin/auth";
import type { Merchant } from "./protocol";

export function merchantConfig(): Merchant {
  const id = process.env.PAYTR_MERCHANT_ID ?? "";
  const key = process.env.PAYTR_MERCHANT_KEY ?? "";
  const salt = process.env.PAYTR_MERCHANT_SALT ?? "";
  if (!/^\d+$/.test(id) || !key || !salt)
    throw new HttpError(503, "Online ödeme şu anda kullanılamıyor.");
  return { id, key, salt };
}
function legalPath(value: string | undefined) {
  return value &&
    /^\/[a-z0-9/-]+$/i.test(value) &&
    !value.startsWith("//") &&
    value !== "/iletisim"
    ? value
    : "";
}
export function paymentConfig() {
  const merchant = merchantConfig();
  const testMode = process.env.PAYTR_TEST_MODE !== "0";
  const url = new URL(process.env.APP_URL || "http://localhost");
  const localTest =
    testMode && ["localhost", "127.0.0.1"].includes(url.hostname);
  const terms = legalPath(process.env.CHECKOUT_TERMS_PATH);
  const information = legalPath(process.env.CHECKOUT_INFORMATION_PATH);
  const legalVersion = process.env.CHECKOUT_LEGAL_VERSION || "";
  if (
    process.env.PAYTR_ENABLED !== "true" ||
    !process.env.DATABASE_URL ||
    !process.env.APP_URL ||
    (url.protocol !== "https:" && !localTest) ||
    url.username ||
    url.password ||
    (!testMode && (!terms || !information || !legalVersion))
  )
    throw new HttpError(503, "Online ödeme şu anda kullanılamıyor.");
  return {
    merchant,
    testMode,
    origin: url.origin,
    terms,
    information,
    legalVersion,
  };
}
export function paymentsAvailable() {
  try {
    paymentConfig();
    return true;
  } catch {
    return false;
  }
}
export function customerIp(request: Request, testMode: boolean) {
  // This header must be overwritten by the trusted reverse proxy; never accept a client-controlled forwarding chain.
  const header = process.env.PAYTR_TRUSTED_IP_HEADER;
  const ip =
    testMode && process.env.PAYTR_TEST_USER_IP
      ? process.env.PAYTR_TEST_USER_IP
      : header
        ? request.headers.get(header)?.trim()
        : "";
  if (
    !ip ||
    !isIP(ip) ||
    ip.length > 39 ||
    ip === "::1" ||
    ip.startsWith("127.")
  )
    throw new HttpError(
      503,
      "Ödeme bağlantısı doğrulanamadı. Lütfen daha sonra tekrar deneyin.",
    );
  return ip;
}
export function shippingFee(subtotal: number) {
  const threshold = process.env.CHECKOUT_FREE_SHIPPING_KURUS || "200000";
  const fee = process.env.CHECKOUT_SHIPPING_FEE_KURUS || "";
  if (!/^\d{1,9}$/.test(threshold))
    throw new HttpError(503, "Kargo bedeli henüz tanımlanmadı.");
  if (subtotal >= Number(threshold)) return 0;
  if (!/^\d{1,8}$/.test(fee))
    throw new HttpError(503, "Kargo bedeli henüz tanımlanmadı.");
  return Number(fee);
}

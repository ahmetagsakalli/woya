import { createHmac } from "node:crypto";
import { z } from "zod";
import { checkOrigin, HttpError, rateLimit, readJson } from "@/lib/admin/auth";
import { db, databaseConfigured } from "@/lib/admin/db";
import {
  cookieHash,
  customerSession,
  requireCustomer,
} from "@/lib/customer/auth";
import {
  addresses,
  consumeToken,
  deleteAddress,
  login,
  logout,
  register,
  requestEmail,
  saveAddress,
  securityAction,
  updateProfile,
} from "@/lib/customer/accounts";
import {
  addressSchema,
  cartItemsSchema,
  emailSchema,
  nameSchema,
  passwordSchema,
  profileSchema,
} from "@/lib/customer/schema";
import { readCart, writeCart } from "@/lib/customer/cart-service";
import {
  addMessage,
  claimOrder,
  consumeGuestToken,
  createRequest,
  listOrders,
  readOrder,
  requestGuestAccess,
} from "@/lib/customer/orders";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "private, no-store",
  Vary: "Cookie",
  "Referrer-Policy": "no-referrer",
};
const ok = (data: unknown) => Response.json(data, { headers });
function failure(e: unknown) {
  if (e instanceof HttpError)
    return Response.json({ error: e.message }, { status: e.status, headers });
  if (e instanceof z.ZodError)
    return Response.json(
      {
        error:
          "Alanları kontrol edin. Şifre en az 12 karakter olmalı; adres ve telefon eksiksiz girilmelidir.",
      },
      { status: 400, headers },
    );
  if ((e as { code?: string })?.code === "23505")
    return Response.json(
      {
        error: "İşlem tamamlanamadı. Bilgileri kontrol edip sayfayı yenileyin.",
      },
      { status: 409, headers },
    );
  // Only a bounded SQLSTATE; never raw database/provider/request details.
  const code = (e as { code?: string })?.code;
  console.error("Customer operation failed", {
    code: code && /^[A-Z0-9]{5}$/.test(code) ? code : "unavailable",
  });
  return Response.json(
    { error: "Hesap hizmetine şu anda ulaşılamıyor. Lütfen tekrar deneyin." },
    { status: 503, headers },
  );
}
const token = z.string().regex(/^[a-f0-9]{64}$/);
const reference = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[A-Za-z0-9-]+$/);
const password = z
  .string()
  .min(1)
  .max(64)
  .refine((v) => new TextEncoder().encode(v).length <= 72);
const message = z.string().trim().min(1).max(3000);
const version = z.number().int().positive();
type Context = { params: Promise<{ action: string }> };
export async function GET(request: Request, context: Context) {
  try {
    const { action } = await context.params;
    if (action === "session") {
      const session = await customerSession();
      return ok({ customer: session?.customer ?? null });
    }
    if (action === "addresses") return ok({ addresses: await addresses() });
    if (action === "cart") return ok(await readCart());
    if (action === "security") {
      const session = await requireCustomer();
      const sessions =
        await db()`SELECT created_at,expires_at,token_hash=${session.tokenHash} AS current FROM woya_customer_sessions WHERE customer_id=${session.customer.id} AND credential_version=${session.version} AND expires_at>now() ORDER BY created_at DESC`;
      return ok({ sessions });
    }
    const params = new URL(request.url).searchParams;
    if (action === "orders")
      return ok(
        await listOrders(
          z.coerce
            .number()
            .int()
            .min(1)
            .max(100000)
            .parse(params.get("page") || 1),
        ),
      );
    if (action === "order")
      return ok(await readOrder(reference.parse(params.get("reference"))));
    throw new HttpError(404, "İşlem bulunamadı.");
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request, context: Context) {
  try {
    checkOrigin(request);
    if (
      !databaseConfigured() ||
      (process.env.CUSTOMER_AUTH_SECRET?.length ?? 0) < 32
    )
      throw new HttpError(503, "Hesap hizmeti henüz yapılandırılmadı.");
    let configuredOrigin: URL;
    try {
      configuredOrigin = new URL(process.env.APP_URL || "");
    } catch {
      throw new HttpError(503, "Hesap hizmeti henüz yapılandırılmadı.");
    }
    if (
      configuredOrigin.protocol !== "https:" &&
      !(
        configuredOrigin.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(configuredOrigin.hostname)
      )
    )
      throw new HttpError(503, "Güvenli hesap bağlantısı yapılandırılmadı.");
    const { action } = await context.params;
    const raw = await readJson(request, 65000);
    const body = z.record(z.string(), z.unknown()).parse(raw);
    const sensitive = [
      "login",
      "register",
      "forgot",
      "resend",
      "guest-access",
      "verify",
      "reset",
      "email-verify",
      "guest-verify",
      "password",
      "email",
      "close",
    ].includes(action);
    const ipHeader = process.env.CUSTOMER_TRUSTED_IP_HEADER;
    const ip = ipHeader ? request.headers.get(ipHeader) || "unknown" : "shared";
    const digest = (v: string) =>
      createHmac("sha256", process.env.CUSTOMER_AUTH_SECRET!)
        .update(v)
        .digest("hex");
    await rateLimit(
      `customer:ip:${digest(ip)}:${sensitive ? "auth" : "write"}`,
      sensitive ? 60 : 600,
      600,
    );
    if (sensitive) {
      const identity =
        typeof body.email === "string"
          ? body.email.toLowerCase()
          : (await cookieHash()) || ip;
      await rateLimit(
        `customer:attempt:${digest(identity)}:${action}`,
        action === "login" ? 10 : 5,
        900,
      );
    }
    if (action === "register")
      return ok(
        await register(
          z
            .object({
              email: emailSchema,
              password: passwordSchema,
              firstName: nameSchema,
              lastName: nameSchema,
            })
            .strict()
            .parse(body),
        ),
      );
    if (action === "login") {
      const i = z.object({ email: emailSchema, password }).strict().parse(body);
      return ok(await login(i.email, i.password));
    }
    if (action === "logout") return ok(await logout());
    if (action === "forgot" || action === "resend") {
      const i = z.object({ email: emailSchema }).strict().parse(body);
      return ok(
        await requestEmail(i.email, action === "forgot" ? "reset" : "verify"),
      );
    }
    if (action === "verify") {
      const i = z.object({ token, password }).strict().parse(body);
      return ok(await consumeToken(i.token, "verify", i.password));
    }
    if (action === "email-verify") {
      const i = z.object({ token }).strict().parse(body);
      return ok(await consumeToken(i.token, "email"));
    }
    if (action === "reset") {
      const i = z
        .object({ token, password: passwordSchema })
        .strict()
        .parse(body);
      return ok(await consumeToken(i.token, "reset", i.password));
    }
    if (action === "profile")
      return ok(await updateProfile(profileSchema.parse(body)));
    if (action === "password")
      return ok(
        await securityAction(
          "password",
          z
            .object({ password, newPassword: passwordSchema })
            .strict()
            .parse(body),
        ),
      );
    if (action === "email")
      return ok(
        await securityAction(
          "email",
          z.object({ password, email: emailSchema }).strict().parse(body),
        ),
      );
    if (action === "close")
      return ok(
        await securityAction(
          "close",
          z
            .object({ password, confirm: z.literal(true) })
            .strict()
            .parse(body),
        ),
      );
    if (action === "revoke") return ok(await securityAction("revoke", {}));
    if (action === "address-save")
      return ok(
        await saveAddress(
          z
            .object({
              id: z.uuid().optional(),
              creationId: z.uuid().optional(),
              version: version.optional(),
              data: addressSchema,
              deliveryDefault: z.boolean(),
              billingDefault: z.boolean(),
            })
            .strict()
            .parse(body),
        ),
      );
    if (action === "address-delete") {
      const i = z.object({ id: z.uuid(), version }).strict().parse(body);
      return ok(await deleteAddress(i.id, i.version));
    }
    if (action === "cart-save" || action === "cart-merge")
      return ok(
        await writeCart(
          z
            .object({
              items: cartItemsSchema,
              owner: z.uuid(),
              ...(action === "cart-merge"
                ? { mergeId: z.uuid() }
                : { version: z.number().int().min(0) }),
            })
            .strict()
            .parse(body),
        ),
      );
    if (action === "guest-access") {
      const i = z
        .object({ reference, email: emailSchema })
        .strict()
        .parse(body);
      return ok(await requestGuestAccess(i.reference, i.email));
    }
    if (action === "guest-verify")
      return ok(
        await consumeGuestToken(z.object({ token }).strict().parse(body).token),
      );
    if (action === "claim")
      return ok(
        await claimOrder(
          z.object({ reference }).strict().parse(body).reference,
        ),
      );
    if (action === "request")
      return ok(
        await createRequest(
          z
            .object({
              reference,
              requestId: z.uuid(),
              kind: z.enum(["cancel", "return", "support"]),
              body: message,
            })
            .strict()
            .parse(body),
        ),
      );
    if (action === "message")
      return ok(
        await addMessage(
          z
            .object({
              reference,
              id: z.uuid(),
              submissionId: z.uuid(),
              body: message,
            })
            .strict()
            .parse(body),
        ),
      );
    throw new HttpError(404, "İşlem bulunamadı.");
  } catch (e) {
    return failure(e);
  }
}

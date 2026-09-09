import Link from "next/link";
import { z } from "zod";
import { notFound } from "next/navigation";
import { HttpError } from "@/lib/admin/auth";
import { readOrder } from "@/lib/customer/orders";
import { pageSession } from "@/lib/customer/auth";
import type { CustomerOrder } from "@/lib/customer/types";
import { OrderView } from "../../order-view";
export const metadata = { title: "Sipariş detayı" };
export default async function Page({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  if (
    !z
      .string()
      .min(1)
      .max(80)
      .regex(/^[A-Za-z0-9-]+$/)
      .safeParse(reference).success
  )
    notFound();
  let order: CustomerOrder;
  try {
    order = JSON.parse(
      JSON.stringify(await readOrder(reference)),
    ) as CustomerOrder;
  } catch (e) {
    if (e instanceof HttpError && [401, 404].includes(e.status))
      return (
        <>
          <h1>Siparişe erişilemiyor</h1>
          <p>
            Hesabınıza giriş yapın veya misafir siparişinizi e-postayla
            doğrulayın.
          </p>
          <Link href="/profil">Giriş yap</Link> ·{" "}
          <Link href="/profil/misafir">Misafir erişimi</Link>
        </>
      );
    throw e;
  }
  const session = await pageSession();
  return (
    <>
      <h1>Sipariş detayı</h1>
      <OrderView
        order={order}
        canClaim={
          session?.customer.email === order.customer.email.toLowerCase()
        }
      />
    </>
  );
}

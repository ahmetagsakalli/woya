import "server-only";
import { db } from "../admin/db";
import { HttpError } from "../admin/auth";
import { hashToken, lockCustomer, requireCustomer } from "./auth";
import { mergeItems } from "./cart";
import type { AccountCartItem } from "./schema";
export async function readCart() {
  const { customer } = await requireCustomer();
  const [row] =
    await db()`SELECT items,version FROM woya_customer_carts WHERE customer_id=${customer.id}`;
  return {
    items: (row?.items ?? []) as AccountCartItem[],
    version: Number(row?.version ?? 0),
    owner: customer.id,
  };
}
export async function writeCart(input: {
  items: AccountCartItem[];
  owner: string;
  version?: number;
  mergeId?: string;
}) {
  const session = await requireCustomer();
  if (session.customer.id !== input.owner)
    throw new HttpError(409, "Hesap değişti. Sepeti yeniden açın.");
  return db().begin(async (tx) => {
    await lockCustomer(tx, session);
    const [cart] =
      await tx`SELECT items,version FROM woya_customer_carts WHERE customer_id=${session.customer.id} FOR UPDATE`;
    const current = {
      items: (cart?.items ?? []) as AccountCartItem[],
      version: Number(cart?.version ?? 0),
      owner: session.customer.id,
    };
    let items = mergeItems([], input.items);
    if (input.mergeId) {
      const inputHash = hashToken(JSON.stringify(items));
      const [previous] =
        await tx`SELECT customer_id,input_hash FROM woya_cart_merges WHERE merge_id=${input.mergeId}`;
      if (previous) {
        if (
          previous.customer_id !== session.customer.id ||
          previous.input_hash !== inputHash
        )
          throw new HttpError(
            409,
            "Bu misafir sepeti daha önce işlendi. Sepeti yenileyin.",
          );
        return current;
      }
      await tx`INSERT INTO woya_cart_merges(merge_id,customer_id,input_hash) VALUES(${input.mergeId},${session.customer.id},${inputHash})`;
      items = mergeItems(current.items, items);
    } else if (input.version !== current.version)
      throw new HttpError(
        409,
        "Sepet başka bir sekmede değişti. Güncel sepeti yeniden yükleyin.",
      );
    if (items.length > 50)
      throw new HttpError(
        409,
        "Sepette en fazla 50 farklı seçim olabilir. Misafir sepetinizi azaltın.",
      );
    const [saved] =
      await tx`INSERT INTO woya_customer_carts(customer_id,items) VALUES(${session.customer.id},${tx.json(items)}) ON CONFLICT(customer_id) DO UPDATE SET items=excluded.items,version=woya_customer_carts.version+1,updated_at=now() RETURNING version`;
    return {
      items,
      version: Number(saved.version),
      owner: session.customer.id,
    };
  });
}

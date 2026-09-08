import { cartKey } from "../cart-key";
import type { AccountCartItem } from "./schema";
export function mergeItems(
  account: AccountCartItem[],
  guest: AccountCartItem[],
) {
  const map = new Map<string, AccountCartItem>();
  for (const item of [...account, ...guest]) {
    const key = cartKey(item);
    map.set(key, {
      ...item,
      quantity: Math.min(99, (map.get(key)?.quantity ?? 0) + item.quantity),
    });
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "en"))
    .map(([, item]) => item);
}

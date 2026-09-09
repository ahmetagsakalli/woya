import { cartKey } from "../cart-key";
import type { CheckoutItem } from "./schema";

export function subtractPurchase<
  T extends {
    slug: string;
    quantity: number;
    configuration?: CheckoutItem["configuration"];
  },
>(cart: T[], purchased: CheckoutItem[]) {
  const quantities = new Map(
    purchased.map((item) => [cartKey(item), item.quantity]),
  );
  return cart.flatMap((item) => {
    const quantity = item.quantity - (quantities.get(cartKey(item)) || 0);
    return quantity > 0 ? [{ ...item, quantity }] : [];
  });
}

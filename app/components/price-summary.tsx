import type { calculateSelectionPrice, MeasuredType } from "@/lib/pricing";
import styles from "./measurement-controls.module.css";
const money = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
    n,
  );
export function PriceSummary({
  result,
  kind,
  originalPrice,
}: {
  result: ReturnType<typeof calculateSelectionPrice>;
  kind: MeasuredType;
  originalPrice?: number | null;
}) {
  return (
    <div className={styles.price} aria-live="polite">
      {result.price === null ? (
        <p className={styles.error}>{result.error}</p>
      ) : (
        <>
          {originalPrice != null && originalPrice > result.price && <del>{money(originalPrice)}</del>}
          <strong>{money(result.price)}</strong>
          {result.panelArea !== undefined && <dl className={styles.breakdown}>
            {kind !== "saat" && (
              <div>
                <dt>
                  {kind === "set" ? "İki tablo" : "Tablo"} ·{" "}
                  {result.panelArea!.toLocaleString("tr-TR", {
                    maximumFractionDigits: 4,
                  })}{" "}
                  m²
                </dt>
                <dd>{money(result.panelPrice!)}</dd>
              </div>
            )}
            {kind !== "tablo" && (
              <div>
                <dt>
                  Saat ·{" "}
                  {result.clockArea!.toLocaleString("tr-TR", {
                    maximumFractionDigits: 4,
                  })}{" "}
                  m²
                </dt>
                <dd>{money(result.clockPrice!)}</dd>
              </div>
            )}
          </dl>}
        </>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
export const money = (value: number | null) =>
  value === null
    ? "Fiyat belirtilmedi"
    : new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        maximumFractionDigits: 2,
      }).format(value);
export const date = (value: string) =>
  value
    ? new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Europe/Istanbul",
      }).format(new Date(value))
    : "";
export function useSave() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function save(
    resource: string,
    body: unknown,
    destination: string,
    method = "POST",
  ) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/${resource}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error([data.error, ...(data.fields ?? [])].join("\n"));
      router.push(`${destination}?kaydedildi=1`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "İşlem tamamlanamadı.");
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, save };
}
export function FormEnd({ busy, error, disabled = false }: { busy: boolean; error: string; disabled?: boolean }) {
  return (
    <div className="admin-form-end">
      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
      <button className="admin-primary" disabled={busy || disabled} type="submit">
        <Save size={17} />
        {busy ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
      </button>
    </div>
  );
}
export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="admin-empty">{children}</div>;
}

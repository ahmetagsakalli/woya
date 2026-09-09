"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  kindLabels,
  requestLabels,
  requestTransitions,
} from "@/lib/customer/schema";
import type { ServiceRequest } from "@/lib/customer/types";
import { RequestThread } from "../../profil/order-view";
type Summary = {
  requests: (ServiceRequest & { order_id?: string; reference?: string })[];
  closures: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    closure_requested_at: string;
  }[];
  hasNext?: boolean;
};
export function CustomerService({ orderId }: { orderId?: string }) {
  const [data, setData] = useState<Summary>();
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [page, setPage] = useState(1);
  useEffect(() => {
    const c = new AbortController();
    setError("");
    setData(undefined);
    fetch(
      `/api/admin/customer-service?${new URLSearchParams(orderId ? { orderId } : { page: String(page) })}`,
      { cache: "no-store", signal: c.signal },
    )
      .then(async (r) => {
        const result = await r.json();
        if (!r.ok) throw new Error(result.error || "Başvurular alınamadı.");
        return result;
      })
      .then((d) => setData(d))
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      });
    return () => c.abort();
  }, [orderId, revision, page]);
  return (
    <section style={{ marginTop: 32 }}>
      <h2>Müşteri başvuruları</h2>
      {error && (
        <p role="alert">
          {error}{" "}
          <button onClick={() => setRevision((n) => n + 1)}>
            Yeniden dene
          </button>
        </p>
      )}
      {!data && !error && <p role="status">Başvurular yükleniyor…</p>}
      {data && (
        <>
          {!data.requests.length && <p>Başvuru bulunmuyor.</p>}
          {data.requests.map((r) =>
            orderId ? (
              <RequestThread request={r} key={r.id}>
                {!["closed", "rejected"].includes(r.status) && (
                  <AdminReply
                    request={r}
                    saved={() => setRevision((n) => n + 1)}
                  />
                )}
              </RequestThread>
            ) : (
              <p key={r.id}>
                <Link href={`/admin/siparisler/${r.order_id}`}>
                  {r.reference}
                </Link>{" "}
                · {kindLabels[r.kind]} · {requestLabels[r.status]}
              </p>
            ),
          )}
          {!orderId && (
            <>
              <h2>Hesap kapatma talepleri</h2>
              <p>
                Hesap erişimi kapatılmıştır. Saklama ve silme işlemlerini
                işletmenin onaylı saklama politikasına göre değerlendirin. Bu
                ekran sipariş veya ödeme kaydı silmez.
              </p>
              {!data.closures.length ? (
                <p>Kapatma talebi bulunmuyor.</p>
              ) : (
                data.closures.map((c) => (
                  <p key={c.id}>
                    {c.first_name} {c.last_name} · {c.email} ·{" "}
                    {new Date(c.closure_requested_at).toLocaleString("tr-TR", {timeZone:"Europe/Istanbul"})}
                  </p>
                ))
              )}
              <div className="admin-pagination">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((n) => n - 1)}
                >
                  Önceki
                </button>
                <span>{page}</span>
                <button
                  disabled={!data.hasNext}
                  onClick={() => setPage((n) => n + 1)}
                >
                  Sonraki
                </button>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
function AdminReply({
  request,
  saved,
}: {
  request: ServiceRequest;
  saved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submission = useRef("");
  return (
    <form
      className="admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        const form = new FormData(e.currentTarget);
        submission.current ||= crypto.randomUUID();
        setBusy(true);
        setError("");
        try {
          const r = await fetch("/api/admin/customer-service", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: request.id,
              version: request.version,
              status: form.get("status"),
              body: form.get("body"),
              submissionId: submission.current,
            }),
          });
          const d = await r.json();
          if (!r.ok) throw new Error(d.error || "Kaydedilemedi.");
          saved();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Bağlantı kurulamadı.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <p>
        Başvuru kararı otomatik sipariş iptali veya para iadesi yapmaz. Gerçek
        iade işlemini PayTR panelinde doğrulayın.
      </p>
      <fieldset disabled={busy}>
        <label>
          Başvuru durumu
          <select name="status" defaultValue={request.status}>
            {[request.status, ...requestTransitions[request.status]].map(
              (s) => (
                <option key={s} value={s}>
                  {requestLabels[s as keyof typeof requestLabels]}
                </option>
              ),
            )}
          </select>
        </label>
        <label>
          Müşteriye yanıt
          <textarea name="body" required maxLength={3000} rows={4} />
        </label>
        <button disabled={busy}>
          {busy ? "Kaydediliyor…" : "Yanıtı ve durumu kaydet"}
        </button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, LogOut } from "lucide-react";
import { passwordChangeSchema } from "@/lib/admin/security-schema";
import { date } from "./shared";

function PasswordField({
  name,
  label,
  newPassword = false,
}: {
  name: string;
  label: string;
  newPassword?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <div className="admin-password-input">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={newPassword ? "new-password" : "current-password"}
          minLength={newPassword ? 12 : 1}
          maxLength={newPassword ? 72 : 128}
          required
          spellCheck={false}
          autoCapitalize="none"
        />
        <button
          type="button"
          aria-label={`${label}: ${visible ? "gizle" : "göster"}`}
          title={visible ? "Şifreyi gizle" : "Şifreyi göster"}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

export function SecurityPanel({
  summary,
}: {
  summary: {
    passwordChangedAt: string | null;
    activeSessions: number;
    otherSessions: number;
    expiresAt: string | null;
  };
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"password" | "sessions" | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    setMessage("");
    const form = event.currentTarget;
    const parsed = passwordChangeSchema.safeParse(
      Object.fromEntries(new FormData(form)),
    );
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(" "));
      return;
    }
    setPending("password");
    try {
      const response = await fetch("/api/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error([result.error, ...(result.fields ?? [])].join(" "));
      form.reset();
      window.location.replace("/admin/giris?parola=degisti");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Şifre değiştirilemedi.",
      );
      setPending(null);
    }
  }
  async function revokeSessions() {
    if (
      pending ||
      !window.confirm(
        "Diğer tüm oturumlar kapatılsın mı? Bu oturum açık kalacak.",
      )
    )
      return;
    setPending("sessions");
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/security", { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage(`${result.revoked} oturum kapatıldı.`);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Oturumlar kapatılamadı.",
      );
    } finally {
      setPending(null);
    }
  }
  return (
    <>
      {error && (
        <p role="alert" className="admin-error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="admin-success">
          {message}
        </p>
      )}
      <div className="admin-security-layout">
        <section aria-labelledby="password-heading">
          <h2 id="password-heading">Şifre Değiştir</h2>
          <form onSubmit={changePassword} aria-busy={pending === "password"}>
            <fieldset
              className="admin-security-fields"
              disabled={pending !== null}
            >
              <PasswordField name="currentPassword" label="Mevcut şifre" />
              <PasswordField
                name="newPassword"
                label="Yeni şifre"
                newPassword
              />
              <PasswordField
                name="confirmPassword"
                label="Yeni şifre tekrar"
                newPassword
              />
              <p className="admin-muted">
                En az 12 karakter. Şifre değişince bu oturum dahil tüm oturumlar
                kapatılır.
              </p>
              <button className="admin-primary" type="submit">
                <KeyRound size={18} />
                {pending === "password"
                  ? "Değiştiriliyor…"
                  : "Şifreyi değiştir"}
              </button>
            </fieldset>
          </form>
        </section>
        <section aria-labelledby="sessions-heading">
          <h2 id="sessions-heading">Oturumlar</h2>
          <dl className="admin-security-details">
            <div>
              <dt>Açık oturum</dt>
              <dd>{summary.activeSessions}</dd>
            </div>
            <div>
              <dt>Diğer oturumlar</dt>
              <dd>{summary.otherSessions}</dd>
            </div>
            <div>
              <dt>Bu oturumun bitişi</dt>
              <dd>
                {summary.expiresAt
                  ? date(summary.expiresAt)
                  : "Oturum sona erdi"}
              </dd>
            </div>
            <div>
              <dt>Son şifre değişikliği</dt>
              <dd>
                {summary.passwordChangedAt
                  ? date(summary.passwordChangedAt)
                  : "Henüz değiştirilmedi"}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            disabled={pending !== null || summary.otherSessions === 0}
            onClick={revokeSessions}
          >
            <LogOut size={18} />
            {pending === "sessions" ? "Kapatılıyor…" : "Diğer oturumları kapat"}
          </button>
        </section>
      </div>
    </>
  );
}

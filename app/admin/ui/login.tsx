"use client";
import { useState, type FormEvent } from "react";
import { LogIn } from "lucide-react";
export function LoginForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fields = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fields)),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      window.location.assign("/admin");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bağlantı kurulamadı.");
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="admin-form">
      <label>
        Parola
        <input
          name="password"
          type="password"
          required
          maxLength={128}
          autoComplete="current-password"
        />
      </label>
      {error && (
        <p role="alert" className="admin-error">
          {error}
        </p>
      )}
      <button disabled={busy} className="admin-primary">
        <LogIn size={18} />
        {busy ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>
    </form>
  );
}

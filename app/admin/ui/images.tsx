"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, Upload, X, Check } from "lucide-react";
import type { SiteContent } from "@/lib/admin/schema";
type Picture = SiteContent["heroImages"][number];
export function MediaLibrary({ onPick }: { onPick?: (url: string) => void }) {
  const [images, setImages] = useState<{ url: string; name: string }[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(36);
  async function load() {
    setError("");
    setLoading(true);
    try {
      const r = await fetch("/api/admin/media");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setImages(d.images);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kütüphane yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const r = await fetch("/api/admin/media", { method: "POST", body: form });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      await load();
      if (onPick) onPick(d.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setBusy(false);
    }
  }
  const filtered = images.filter((i) =>
    i.name.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr")),
  );
  return (
    <div>
      <div className="admin-toolbar">
        <input
          type="search"
          aria-label="Görsel ara"
          placeholder="Görsel ara"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setLimit(36); }}
        />
        <label className="admin-upload">
          <Upload size={17} />
          {busy ? "Yükleniyor…" : "Görsel yükle"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            disabled={busy}
            onChange={(e) => void upload(e.target.files?.[0])}
          />
        </label>
      </div>
      <p className="admin-muted">JPG, PNG, WebP, AVIF · En fazla 4 MB</p>
      {error && (
        <div role="alert" className="admin-error">
          {error}
          <button type="button" onClick={() => void load()}>
            Tekrar dene
          </button>
        </div>
      )}
      {loading ? (
        <p role="status">Görseller yükleniyor…</p>
      ) : (
        <div className="admin-media-grid">
          {filtered.slice(0, limit).map((item) => (
            <button
              type="button"
              key={item.url}
              className="admin-media-item"
              onClick={() =>
                onPick
                  ? onPick(item.url)
                  : window.open(item.url, "_blank", "noopener,noreferrer")
              }
              title={onPick ? "Görseli seç" : "Görseli aç"}
            >
              <Image src={item.url} alt={item.name} width={160} height={160} sizes="160px" />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      )}
      {!loading && filtered.length > limit && (
        <div className="admin-toolbar"><button type="button" onClick={() => setLimit((n) => n + 36)}>Daha fazla görsel</button></div>
      )}
      {!loading && !error && !filtered.length && (
        <p className="admin-empty">Görsel bulunamadı.</p>
      )}
    </div>
  );
}
export function ImageEditor({
  images,
  onChange,
  max = 12,
  focus = true,
}: {
  images: Picture[];
  onChange: (images: Picture[]) => void;
  max?: number;
  focus?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(0);
  const [replacing, setReplacing] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const selected = images[active] ?? images[0];
  function update(change: Partial<Picture>) {
    onChange(images.map((im, i) => (i === active ? { ...im, ...change } : im)));
  }
  function move(direction: number) {
    const next = active + direction;
    if (next < 0 || next >= images.length) return;
    const copy = [...images];
    [copy[active], copy[next]] = [copy[next], copy[active]];
    onChange(copy);
    setActive(next);
  }
  return (
    <div className="admin-image-editor">
      <div className="admin-image-strip">
        {images.map((im, i) => (
          <button
            type="button"
            key={`${im.url}-${i}`}
            aria-label={`Görsel ${i + 1}`}
            aria-pressed={i === active}
            onClick={() => setActive(i)}
          >
            <Image src={im.url} alt={im.alt} width={54} height={64} sizes="54px" />
            {i === 0 && <Check size={13} />}
          </button>
        ))}
        <button
          type="button"
          disabled={images.length >= max}
          title="Görsel ekle"
          aria-label="Görsel ekle"
          onClick={() => {
            setReplacing(false);
            setLibraryOpen(true);
            dialog.current?.showModal();
          }}
        >
          <ImagePlus size={22} />
        </button>
      </div>
      {selected && (
        <>
          <div className="admin-image-preview">
            <Image
              src={selected.url}
              alt={selected.alt}
              width={800}
              height={600}
              sizes="(max-width: 760px) 90vw, (max-width: 1150px) 70vw, 420px"
              style={{ objectPosition: `${selected.x}% ${selected.y}%` }}
            />
          </div>
          <div className="admin-toolbar">
            <span>
              Görsel {active + 1} / {images.length}
            </span>
            <button
              type="button"
              title="Görseli değiştir"
              aria-label="Görseli değiştir"
              onClick={() => {
                setReplacing(true);
                setLibraryOpen(true);
                dialog.current?.showModal();
              }}
            >
              <ImagePlus size={16} />
            </button>
            <button
              type="button"
              title="Öne taşı"
              aria-label="Öne taşı"
              disabled={active === 0}
              onClick={() => move(-1)}
            >
              <ArrowUp size={16} />
            </button>
            <button
              type="button"
              title="Arkaya taşı"
              aria-label="Arkaya taşı"
              disabled={active === images.length - 1}
              onClick={() => move(1)}
            >
              <ArrowDown size={16} />
            </button>
            <button
              type="button"
              title="Görseli kaldır"
              aria-label="Görseli kaldır"
              onClick={() => {
                onChange(images.filter((_, i) => i !== active));
                setActive(0);
              }}
            >
              <X size={16} />
            </button>
          </div>
          <label>
            Alternatif metin
            <input
              value={selected.alt}
              maxLength={200}
              onChange={(e) => update({ alt: e.target.value })}
            />
          </label>
          {focus && (
            <>
              <label>
                Yatay odak · %{selected.x}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selected.x}
                  onChange={(e) => update({ x: Number(e.target.value) })}
                />
              </label>
              <label>
                Dikey odak · %{selected.y}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selected.y}
                  onChange={(e) => update({ y: Number(e.target.value) })}
                />
              </label>
            </>
          )}
        </>
      )}
      <dialog ref={dialog} className="admin-dialog" onClose={() => setLibraryOpen(false)}>
        <header>
          <h2>Görsel Seç</h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
        </header>
        {libraryOpen && <MediaLibrary
          onPick={(url) => {
            if (replacing) {
              onChange(
                images.map((im, i) => (i === active ? { ...im, url } : im)),
              );
            } else if (!images.some((im) => im.url === url)) {
              onChange([...images, { url, alt: "", x: 50, y: 50 }]);
              setActive(images.length);
            }
            dialog.current?.close();
          }}
        />}
      </dialog>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check, ImagePlus, RotateCcw, X, ZoomIn } from "lucide-react";
import type { BuilderParts } from "@/lib/admin/schema";
import { cropRegionsSchema, defaultRegions, partNames, type CropPart, type CropRegions, type Point, type Quad } from "@/lib/crop";
import { MediaLibrary } from "./images";
import styles from "./part-crop-editor.module.css";

const corners = ["Sol üst", "Sağ üst", "Sağ alt", "Sol alt"];
export default function PartCropEditor({ initial, sourceImage, set, onApply, onCancel }: {
  initial?: BuilderParts; sourceImage?: string; set: boolean;
  onApply: (parts: BuilderParts) => void; onCancel: () => void;
}) {
  const [source, setSource] = useState(initial?.source ?? sourceImage ?? "");
  const [regions, setRegions] = useState<CropRegions>(() => initial && Boolean(initial.left) === set ? initial.regions : defaultRegions(set));
  const [active, setActive] = useState<CropPart>(set ? "left" : "center");
  const [corner, setCorner] = useState(0);
  const [library, setLibrary] = useState(!source);
  const [aspect, setAspect] = useState(1.5);
  const [loaded, setLoaded] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [images, setImages] = useState<Partial<Record<CropPart, string>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const plane = useRef<HTMLDivElement>(null);
  const drag = useRef<{ corner: number; pointerId: number } | null>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const parts: CropPart[] = set ? ["left", "center", "right"] : ["center"];
  const region = regions[active]!;
  const valid = cropRegionsSchema.safeParse(regions).success;

  function update(next: CropRegions) {
    setRegions(next); setImages({}); setError("");
  }
  function move(index: number, point: Point) {
    const quad = region.quad.map((p, i) => i === index ? {
      x: Math.max(0, Math.min(1, point.x)), y: Math.max(0, Math.min(1, point.y)),
    } : p) as Quad;
    update({ ...regions, [active]: { ...region, quad } });
  }
  function pointer(event: React.PointerEvent) {
    if (drag.current === null || drag.current.pointerId !== event.pointerId || busy || !plane.current) return;
    const rect = plane.current.getBoundingClientRect();
    move(drag.current.corner, { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height });
  }
  async function process(save: boolean) {
    if (busy || !valid || !loaded || (save && !images.center)) return;
    setBusy(true); setError("");
    const controller = new AbortController(); request.current = controller;
    try {
      const response = await fetch("/api/admin/crop", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source, regions, save }), signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.fields?.join(" · ") || data.error || "Parçalar hazırlanamadı.");
      if (save) onApply(data.parts); else setImages(data.images);
    } catch (e) {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "İşlem tamamlanamadı.");
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  return <section className={styles.editor} aria-label="Ürün parçalarını kırp">
    <header className={styles.toolbar}>
      <h2>Ürün Parçaları</h2>
      <button type="button" disabled={busy} onClick={() => setLibrary(!library)}><ImagePlus size={17} /> Kaynak fotoğraf</button>
      <button type="button" disabled={busy} onClick={onCancel} title="Kırpmayı iptal et" aria-label="Kırpmayı iptal et"><X size={18} /></button>
    </header>
    {library ? <MediaLibrary onPick={(url) => {
      setSource(url); setLoaded(false); setLibrary(false); setZoom(100); update(defaultRegions(set));
    }} /> : source && <>
      <div className={styles.toolbar} role="group" aria-label="Parça seçimi">
        {parts.map((part) => <button key={part} type="button" aria-pressed={part === active} disabled={busy} onClick={() => { setActive(part); setCorner(0); }}>{partNames[part]}</button>)}
        <label className={styles.zoom}><ZoomIn size={18} /><input aria-label="Fotoğraf yakınlaştırma" type="range" min={100} max={250} step={10} value={zoom} disabled={busy} onChange={(e) => setZoom(Number(e.target.value))} /><span>%{zoom}</span></label>
      </div>
      {!loaded && !error && <p role="status">Fotoğraf yükleniyor…</p>}
      <div className={styles.workspace}>
        <div className={styles.viewport}>
          <div style={{ width: `${zoom}%`, padding: 24 }}>
            <div className={styles.plane} ref={plane} style={{ aspectRatio: aspect }}>
              <Image key={source} src={source} alt="Kırpılacak ürün fotoğrafı" fill unoptimized draggable={false} onLoad={(e) => { setAspect(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight); setLoaded(true); }} onError={() => { setLoaded(false); setError("Fotoğraf yüklenemedi. Kaynağı yeniden seçin."); }} />
              {loaded && <>
                <svg className={styles.overlay} viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
                  {parts.map((part) => <polygon key={part} points={regions[part]!.quad.map((p) => `${p.x * 1000},${p.y * 1000}`).join(" ")} fill={part === active ? "#ffffff22" : "#00000044"} stroke={part === active ? "#ffffff" : "#a3a3a3"} strokeWidth={part === active ? 3 : 1} vectorEffect="non-scaling-stroke" />)}
                </svg>
                {region.quad.map((point, index) => <button key={index} type="button" className={styles.handle} style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }} disabled={busy}
                  aria-label={`${partNames[active]} ${corners[index]} köşesi`} title={corners[index]}
                  onPointerDown={(event) => { if (drag.current) return; drag.current = { corner: index, pointerId: event.pointerId }; setCorner(index); event.currentTarget.setPointerCapture(event.pointerId); }}
                  onPointerMove={pointer} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}
                  onFocus={() => setCorner(index)} onKeyDown={(event) => {
                    const step = event.shiftKey ? 0.01 : 0.001;
                    const delta: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
                    if (delta[event.key]) { event.preventDefault(); move(index, { x: point.x + delta[event.key][0], y: point.y + delta[event.key][1] }); }
                  }}>{index + 1}</button>)}
              </>}
            </div>
          </div>
        </div>
        <fieldset className={styles.controls} disabled={busy}>
          <legend>{partNames[active]}</legend>
          <label>Çıktı oranı<select value={region.aspect} disabled={region.mask === "ellipse"} onChange={(e) => update({ ...regions, [active]: { ...region, aspect: Number(e.target.value) } })}>
            <option value={5 / 7}>5 : 7</option><option value={1}>1 : 1</option><option value={2 / 3}>2 : 3</option><option value={3 / 4}>3 : 4</option><option value={4 / 3}>4 : 3</option><option value={3 / 2}>3 : 2</option>
          </select></label>
          {active === "center" && <label>Kesim şekli<select value={region.mask} onChange={(e) => update({ ...regions, center: { ...region, mask: e.target.value as "rectangle" | "ellipse", ...(e.target.value === "ellipse" ? { aspect: 1 } : {}) } })}><option value="rectangle">Dikdörtgen</option><option value="ellipse">Yuvarlak</option></select></label>}
          <label>Köşe<select value={corner} onChange={(e) => setCorner(Number(e.target.value))}>{corners.map((name, i) => <option key={name} value={i}>{i + 1}. {name}</option>)}</select></label>
          {(["x", "y"] as const).map((axis) => <label key={axis}>{axis === "x" ? "Yatay (%)" : "Dikey (%)"}<input type="number" min={0} max={100} step={0.1} value={Number((region.quad[corner][axis] * 100).toFixed(1))} onChange={(e) => move(corner, { ...region.quad[corner], [axis]: Number(e.target.value) / 100 })} /></label>)}
          <button type="button" onClick={() => update({ ...regions, [active]: defaultRegions(set)[active] })}><RotateCcw size={16} /> Seçimi sıfırla</button>
        </fieldset>
      </div>
      {!valid && <p role="alert" className="admin-error">Köşeler kesişiyor veya seçilen alan çok küçük.</p>}
      <div className={styles.previews}>{parts.map((part) => <figure key={part}><div>{images[part] ? <Image src={images[part]!} alt={`${partNames[part]} kırpma önizlemesi`} fill unoptimized /> : <span>Önizleme bekleniyor</span>}</div><figcaption>{partNames[part]}</figcaption></figure>)}</div>
      <div className={styles.toolbar}>
        <button type="button" disabled={busy || !loaded || !valid} onClick={() => void process(false)}>Önizlemeleri hazırla</button>
        <button type="button" className="admin-primary" disabled={busy || !images.center} onClick={() => void process(true)}><Check size={17} /> Parçaları ürüne uygula</button>
        {busy && <span role="status">Parçalar hazırlanıyor…</span>}
      </div>
    </>}
    {error && <p className="admin-error" role="alert">{error}</p>}
  </section>;
}

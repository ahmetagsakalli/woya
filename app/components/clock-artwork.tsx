import Image from "next/image";
import type { CSSProperties } from "react";
import { clockArtwork, clockSource, dialMarkers, type NumeralStyle } from "@/lib/clock-artwork";
import styles from "./clock-artwork.module.css";

export function ClockArtwork({ code, style, alt = "", sizes, source }: {
  code: string;
  style: NumeralStyle | "original";
  source?: string;
  alt?: string;
  sizes: string;
}) {
  if (source) return <Image src={source} alt={alt} fill sizes={sizes} style={{ objectFit: "contain" }} />;
  if (style === "original") return null;
  const profile = clockArtwork(code);
  if (style === "romen" || !profile) {
    return <Image src={clockSource(code, style)} alt={alt} fill sizes={sizes} />;
  }
  return (
    <span className={styles.root} role={alt ? "img" : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true} data-clock-artwork={style}>
      <span className={styles.art} style={{ "--aspect": profile.aspect } as CSSProperties}>
        <Image src={clockSource(code, "romen")} alt="" fill sizes={sizes} className={styles.photo} />
        <span className={styles.face}
          data-round={profile.round} data-dark={profile.dark} data-silver={profile.silver} data-narrow={profile.narrow}
          style={{ left: `${profile.left}%`, top: `${profile.top}%`, width: `${profile.width}%`, height: `${profile.height}%` }}>
          <Image src="/images/builder-parts/woya/clock-glass-v2.png" alt="" fill sizes={sizes} className={styles.glass} />
          <span className={styles.edge} />
          {dialMarkers(style).map((mark) => (
            <span key={mark.hour} className={styles.marker} style={{ left: `${mark.x}%`, top: `${mark.y}%`, "--angle": `${mark.angle}deg` } as CSSProperties}>
              {mark.label
                ? <span className={styles.numeral}>{mark.label}</span>
                : <span className={styles.baton} data-major={mark.major} />}
            </span>
          ))}
          <span className={styles.mechanism} style={{ top: `${profile.pivotY}%` }}>
            <span className={`${styles.hand} ${styles.hour}`}><span /></span>
            <span className={`${styles.hand} ${styles.minute}`}><span /></span>
            <span className={styles.hub} />
          </span>
        </span>
      </span>
    </span>
  );
}

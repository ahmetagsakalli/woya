"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type HeroSlide = {
  src: string;
  focus: string;
  pan: "left" | "right" | "up" | "down";
};

type HeroSlideshowProps = {
  slides: HeroSlide[];
};

export function HeroSlideshow({ slides }: HeroSlideshowProps) {
  const [position, setPosition] = useState<{ active: number; previous: number | null }>({ active: 0, previous: null });
  const loaded = useRef(new Set<string>());
  const activeIndex = slides.length ? position.active % slides.length : 0;
  const nextIndex = (activeIndex + 1) % slides.length;

  useEffect(() => {
    if (slides.length < 2) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      setPosition((current) => {
        const active = current.active % slides.length;
        const next = (active + 1) % slides.length;
        // Retain the current frame until the next image has finished loading.
        return loaded.current.has(slides[next].src) ? { active: next, previous: active } : current;
      });
    }, 5600);

    return () => window.clearInterval(intervalId);
  }, [slides]);

  return (
    <div className="hero-slideshow" aria-hidden="true">
      {slides.map((slide, index) => (index === activeIndex || index === nextIndex || index === position.previous) ? (
        <Image
          key={slide.src}
          className="hero-slide-image"
          data-active={index === activeIndex ? "true" : undefined}
          data-pan={slide.pan}
          src={slide.src}
          alt=""
          fill
          priority={index === 0}
          onLoad={() => loaded.current.add(slide.src)}
          sizes="100vw"
          style={{ objectPosition: slide.focus }}
        />
      ) : null)}
    </div>
  );
}

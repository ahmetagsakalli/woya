"use client";

import Image from "next/image";
import { useState } from "react";

type GalleryItem = {
  src: string;
  alt: string;
  label: string;
  position?: string;
};

export function ProductDetailGallery({
  items,
  title,
}: {
  items: GalleryItem[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex] ?? items[0];

  return (
    <div
      className="product-detail-gallery"
      aria-label={`${title} görsel galerisi`}
    >
      <div className="product-detail-main-image">
        <Image
          src={activeItem.src}
          alt={activeItem.alt}
          fill
          style={{ objectPosition: activeItem.position }}
          priority
          loading="eager"
          sizes="(max-width: 980px) 100vw, 54vw"
        />
      </div>
      <div
        className="product-detail-thumbs"
        role="list"
        aria-label="Ürün görsel seçenekleri"
      >
        {items.map((item, index) => (
          <button
            className="product-detail-thumb"
            data-active={index === activeIndex ? "true" : undefined}
            type="button"
            aria-label={`${item.label} görselini göster`}
            aria-pressed={index === activeIndex}
            key={item.src}
            onClick={() => setActiveIndex(index)}
          >
            <span className="product-detail-thumb-image">
              <Image src={item.src} alt="" fill sizes="92px" />
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

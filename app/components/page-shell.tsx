import Image from "next/image";
import type { ReactNode } from "react";
import { SiteFooter, SiteHeader, SiteSupport, TopAnnouncement } from "./site-chrome";

type PageShellProps = {
  title: string;
  text?: string;
  children: ReactNode;
  image?: string;
};

export function PageShell({
  title,
  text,
  children,
  image = "/images/hero-banner.webp",
}: PageShellProps) {
  return (
    <main>
      <a className="skip-link" href="#icerik">
        İçeriğe geç
      </a>
      <TopAnnouncement />
      <section className="subpage-hero" aria-labelledby="page-title">
        <SiteHeader />
        <Image
          className="subpage-hero-image"
          src={image}
          alt=""
          fill
          priority
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
        />
        <div className="subpage-hero-copy" id="icerik">
          <h1 id="page-title">{title}</h1>
          {text ? <p>{text}</p> : null}
        </div>
      </section>
      {children}
      <SiteFooter />
      <SiteSupport />
    </main>
  );
}

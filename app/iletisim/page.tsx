import type { Metadata } from "next";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { PageShell } from "../components/page-shell";
import { getContent } from "@/lib/admin/repository";
import { InstagramMark } from "../components/site-chrome";

export const metadata: Metadata = {
  title: "İletişim",
  description: "WOYA telefon, Instagram, WhatsApp ve konum bilgilerine ulaşın.",
  alternates: { canonical: "/iletisim" },
};

export default async function ContactPage() {
  const contact = await getContent();
  const phoneHref = contact.phone;
  const phoneDisplay = contact.phoneDisplay;
  const instagramUrl = contact.instagram;
  const whatsappUrl = `https://wa.me/${contact.phone.replace(/\D/g, "")}`;
  const mapsUrl = contact.address
    ? `https://maps.google.com/?q=${encodeURIComponent(contact.address)}`
    : "https://maps.google.com/?q=40.995899,28.669600";
  const mapsEmbedUrl = contact.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed`
    : "https://www.google.com/maps?q=40.995899,28.669600&z=15&output=embed";
  return (
    <PageShell title="Bize Ulaşın">
      <section className="contact-page-section">
        {contact.address && <p>{contact.address}</p>}
        {contact.email && (
          <p>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </p>
        )}
        <div className="contact-card-grid">
          <a href={`tel:${phoneHref}`}>
            <Phone aria-hidden="true" size={24} />
            <span>Telefon</span>
            <strong>{phoneDisplay}</strong>
          </a>
          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <MessageCircle aria-hidden="true" size={24} />
            <span>WhatsApp</span>
            <strong>Hızlı bilgi alın</strong>
          </a>
          <a href={instagramUrl} target="_blank" rel="noreferrer">
            <InstagramMark />
            <span>Instagram</span>
            <strong>
              {contact.instagram
                .replace("https://www.instagram.com/", "@")
                .replace(/\/$/, "")}
            </strong>
          </a>
        </div>

        <div className="contact-map-panel">
          <iframe
            src={mapsEmbedUrl}
            title="WOYA konumu"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <a href={mapsUrl} target="_blank" rel="noreferrer">
            <MapPin aria-hidden="true" size={18} />
            Haritada aç
          </a>
        </div>
      </section>
    </PageShell>
  );
}

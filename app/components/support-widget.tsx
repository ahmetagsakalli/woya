"use client";

import { useEffect, useId, useState } from "react";
import { Headset, Phone, Send, X } from "lucide-react";

type SupportWidgetProps = {
  phoneDisplay: string;
  phoneHref: string;
  whatsappUrl: string;
};

function WhatsAppMark({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.036 6.988 2.914a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

export function SupportWidget({ phoneDisplay, phoneHref, whatsappUrl }: SupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const panelId = `${titleId}-panel`;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <div className="support-widget" data-open={isOpen ? "true" : undefined}>
      <button
        className="support-trigger"
        type="button"
        aria-label="Destek talebi formunu aç"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Headset aria-hidden="true" size={23} />
      </button>

      {isOpen ? (
        <div className="support-panel" id={panelId} role="dialog" aria-labelledby={titleId}>
          <div className="support-panel-head">
            <strong id={titleId}>Destek Talebi</strong>
            <div className="support-direct-actions" aria-label="Hızlı ulaşım seçenekleri">
              <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp ile yazın">
                <WhatsAppMark className="support-link-icon" />
              </a>
              <a href={`tel:${phoneHref}`} aria-label={`Telefonla arayın ${phoneDisplay}`}>
                <Phone aria-hidden="true" size={18} />
              </a>
              <button
                className="support-close"
                type="button"
                aria-label="Destek formunu kapat"
                onClick={() => setIsOpen(false)}
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>
          </div>

          <form className="support-form" action="/destek-talebi" method="GET" target="_blank">
            <label>
              Ad Soyad
              <input name="ad" type="text" autoComplete="name" required />
            </label>
            <label>
              Telefon
              <input name="telefon" type="tel" autoComplete="tel" required />
            </label>
            <label>
              Konu
              <select name="konu" defaultValue="Ürün danışmanlığı">
                <option>Ürün danışmanlığı</option>
                <option>Sipariş ve ödeme</option>
                <option>Teslimat</option>
                <option>Satış sonrası destek</option>
              </select>
            </label>
            <label>
              Mesajınız
              <textarea name="mesaj" rows={4} required />
            </label>
            <button type="submit">
              Talebi Gönder
              <Send aria-hidden="true" size={17} />
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

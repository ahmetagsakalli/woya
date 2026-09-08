"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqItems = [
  {
    id: "custom-order",
    question: "Kişiye özel tablo veya saat nasıl hazırlanıyor?",
    answer:
      "Ürün tipi, ölçü, yüzey ve detay seçenekleri WOYA üretim standartlarına göre belirlenir. Seçimler canlı önizleme üzerinden net ve kontrollü şekilde takip edilir.",
  },
  {
    id: "image-upload",
    question: "Kendi görselimi kullanabilir miyim?",
    answer:
      "Evet. JPG, PNG veya WebP formatındaki görseller kullanılabilir. Set ürünlerde her parça için ayrı görsel seçimi yapılabilir.",
  },
  {
    id: "sizes",
    question: "Tablo ve saat ölçüleri değiştirilebilir mi?",
    answer:
      "Evet. Tek tablo, saat ve set ürünlerde farklı ölçü seçenekleri bulunur. Seçilen ölçü sipariş tutarına ve ürün özelliklerine yansır.",
  },
  {
    id: "sets",
    question: "İkili veya üçlü setlerde parçalar ayrı görünür mü?",
    answer:
      "Evet. Setlerde parçalar önizleme sahnesinde yan yana görünür. Her panel ve saat merkezi ayrı ayrı kişiselleştirilebilir.",
  },
  {
    id: "surface",
    question: "Yüzey ve detay seçenekleri nelerdir?",
    answer:
      "Parlak cam, mat yüzey, kanvas ve metalik seçenekler kullanılabilir. Çerçeve veya saat detaylarında siyah, gold ve beyaz tonları seçilebilir.",
  },
  {
    id: "delivery",
    question: "Üretim ve teslimat süreci nasıl ilerler?",
    answer:
      "Sipariş sonrası tasarım onayı, üretim hazırlığı ve paketleme adımları planlanır. Hazırlık süresi ürün tipine ve seçilen ölçülere göre netleşir.",
  },
];

export function FaqSection({ items = faqItems }: { items?: typeof faqItems }) {
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  function toggleItem(itemId: string) {
    setOpenItemId((currentItemId) =>
      currentItemId === itemId ? null : itemId,
    );
  }

  return (
    <section className="faq-section" id="sss" aria-labelledby="faq-title">
      <div className="faq-inner">
        <h2 id="faq-title">Muhtemelen Merak Ediyorsunuz</h2>

        <div className="faq-grid">
          {items.map((item) => {
            const isOpen = openItemId === item.id;
            const answerId = `${item.id}-answer`;

            return (
              <article
                className="faq-item"
                data-open={isOpen ? "true" : undefined}
                key={item.id}
              >
                <button
                  className="faq-question"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => toggleItem(item.id)}
                >
                  <span>{item.question}</span>
                  <ChevronDown aria-hidden="true" size={18} />
                </button>
                <div className="faq-answer" id={answerId} hidden={!isOpen}>
                  <p>{item.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

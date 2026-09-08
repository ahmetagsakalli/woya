import test from "node:test";
import assert from "node:assert/strict";
import { initialContent } from "../lib/admin/defaults";
import { contentSchema } from "../lib/admin/schema";
import {
  legalPages,
  legalHref,
  legalContact,
  resolveLegalContent,
} from "../lib/legal";
import { legalDocuments } from "../lib/legal-documents";

test("four distinct legal routes contain substantive, uniquely anchored sections", () => {
  assert.equal(new Set(legalPages.map((page) => legalHref(page.slug))).size, 4);
  for (const page of legalPages) {
    const doc = legalDocuments[page.slug];
    assert.ok(doc.intro.length > 100);
    assert.ok(doc.sections.length >= 4);
    assert.equal(
      new Set(doc.sections.map((section) => section.id)).size,
      doc.sections.length,
    );
    for (const section of doc.sections)
      assert.ok(section.paragraphs.join(" ").length > 100);
  }
});
test("legacy placeholders and empty contacts resolve without mutating stored content", () => {
  const old = structuredClone(initialContent);
  old.email = "";
  old.address = " ";
  old.footerLinks = old.footerLinks.map((item) =>
    item.group === "Yasal" ? { ...item, href: "/iletisim" } : item,
  );
  const result = resolveLegalContent(old);
  assert.equal(result.email, legalContact.email);
  assert.equal(result.address, legalContact.address);
  assert.deepEqual(result.footerLinks, initialContent.footerLinks);
  assert.equal(old.email, "");
  assert.ok(
    old.footerLinks
      .filter((item) => item.group === "Yasal")
      .every((item) => item.href === "/iletisim"),
  );
  assert.ok(contentSchema.safeParse(result).success);
});
test("admin edits, removed links, and nonlegal contact links remain unchanged", () => {
  const edited = {
    ...initialContent,
    address: "Yeni işletme adresi",
    email: "destek@example.com",
    footerLinks: [
      {
        label: legalPages[0].title,
        href: "/ozel-sozlesme",
        group: "Yasal" as const,
      },
      { label: "Destek talebi", href: "/iletisim", group: "Destek" as const },
    ],
  };
  assert.deepEqual(resolveLegalContent(edited), edited);
  assert.deepEqual(
    resolveLegalContent(resolveLegalContent(initialContent)),
    initialContent,
  );
});
test("privacy inventory matches first-party storage and distinguishes localStorage", () => {
  const text = JSON.stringify(legalDocuments["cerez-politikasi"]);
  for (const key of [
    "woya-cart-v1",
    "woya-purchased:",
    "woya-checkout",
    "woya-admin-session",
    "7 gün",
    "8 saat",
    "Yerel depolama",
  ])
    assert.ok(text.includes(key));
  assert.ok(text.includes("Sabit bir son kullanma süresi yoktur"));
});

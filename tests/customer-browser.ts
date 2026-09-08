import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { defaultDimensions, initialPricing } from "../lib/pricing";
const exec = promisify(execFile);
export async function verifyBrowser({
  base,
  password,
  customerEmail,
  productSlug,
  mailToken,
  resetLimits,
}: {
  base: string;
  password: string;
  customerEmail: string;
  productSlug: string;
  mailToken: (e: string) => string;
  resetLimits: () => Promise<void>;
}) {
  await mkdir("work/customer-qa", { recursive: true });
  // Skill's quick visual smoke check, isolated from the user's browser sessions.
  try {
    await exec("pnpm", [
      "dlx",
      "agent-browser",
      "--session",
      "woya-accounts",
      "open",
      base + "/profil",
    ]);
    const { stdout } = await exec("pnpm", [
      "dlx",
      "agent-browser",
      "--session",
      "woya-accounts",
      "snapshot",
      "-i",
    ]);
    if (!stdout.includes("Giriş yap"))
      throw new Error("Account page has no login form");
    await exec("pnpm", [
      "dlx",
      "agent-browser",
      "--session",
      "woya-accounts",
      "screenshot",
      "work/customer-qa/agent-browser-login.png",
    ]);
    console.log(
      "PASS browser: agent-browser page load, interactive login form and screenshot",
    );
  } finally {
    await exec("pnpm", [
      "dlx",
      "agent-browser",
      "--session",
      "woya-accounts",
      "close",
    ]).catch(() => {});
  }
  const browser = await chromium.launch({ headless: true });
  let diagnosticPage: import("@playwright/test").Page | undefined;
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      timezoneId: "Europe/Istanbul",
    });
    await context.route("**/*", (route) =>
      new URL(route.request().url()).origin === base
        ? route.continue()
        : route.fulfill({
            status: 200,
            contentType: "text/html",
            body: "<p>Test sağlayıcısı</p>",
          }),
    );
    const page = await context.newPage();
    diagnosticPage = page;
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    // Only synthetic guest selections; account carts must never be persisted in localStorage.
    await page.goto(base + "/profil");
    await page.evaluate(
      (item) => localStorage.setItem("woya-cart-v1", JSON.stringify([item])),
      {
        slug: productSlug,
        title: "Test ürün",
        image: "/images/woya-logo-white.png",
        quantity: 2,
        configuration: {
          source: "product",
          pricingMode: "standard",
          dimensions: defaultDimensions(initialPricing, "rectangle"),
        },
      },
    );
    await page.reload();
    await page.getByLabel("E-posta", { exact: true }).fill(customerEmail);
    await page.getByLabel(/^Şifre/).fill(password);
    await page.getByRole("button", { name: "Giriş yap", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Profilim", exact: true }),
    ).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("woya-cart-v1")))
      .toBe(null);
    const persisted = await context.request.get(base + "/api/hesap/cart");
    expect((await persisted.json()).items[0].quantity).toBe(2);
    await page.reload();
    expect(
      (await (await context.request.get(base + "/api/hesap/cart")).json())
        .items[0].quantity,
    ).toBe(2);
    console.log(
      "PASS browser: login merges the guest cart once, clears guest storage and persists account selections",
    );
    await page.goto(base + "/profil/adresler");
    await page.getByRole("button", { name: "Adres ekle", exact: true }).click();
    await page.getByLabel("Adres başlığı", { exact: true }).fill("Ev");
    await page
      .getByLabel("Ad soyad", { exact: true })
      .fill("Tarayıcı Test Müşteri");
    await page.getByLabel("Telefon", { exact: true }).fill("05551234567");
    await page
      .getByLabel(/^Açık adres/)
      .fill("Test Mahallesi Örnek Sokak No 5 İstanbul");
    await page.getByLabel("Varsayılan teslimat adresi").check();
    await page.getByLabel("Varsayılan fatura adresi").check();
    await page.getByRole("button", { name: "Kaydet", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Ev", exact: true }),
    ).toBeVisible();
    await page.goto(base + "/odeme");
    await expect(page.getByLabel("Ad soyad", { exact: true })).toHaveValue(
      "Tarayıcı Test Müşteri",
    );
    await page.getByLabel("Fatura adresim farklı", { exact: true }).check();
    await page
      .getByLabel(/^Fatura açık adresi/)
      .fill("Fatura Mahallesi Başka Sokak No 6 Ankara");
    await expect(page.getByLabel(/^Açık adres/)).toHaveValue(
      "Test Mahallesi Örnek Sokak No 5 İstanbul",
    );
    console.log(
      "PASS browser: address management and independently editable checkout billing/delivery",
    );
    await page.locator('input[name="consent"]').check();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/odeme/islem/*");
    const orderReference = page.url().split("/").pop()!;
    await page.goto(base + "/profil/siparisler/" + orderReference);
    await expect(
      page.getByRole("heading", { name: "Sipariş detayı", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("textbox", { name: "Açıklama", exact: true })
      .fill("Tarayıcı üzerinden destek talebi");
    await page
      .getByRole("button", { name: "Başvuru oluştur", exact: true })
      .click();
    await expect(
      page.getByText("Tarayıcı üzerinden destek talebi", { exact: true }),
    ).toBeVisible();
    console.log(
      "PASS browser: checkout submission preserves billing and opens owned order support",
    );
    const address = await (
      await context.request.get(base + "/api/hesap/addresses")
    ).json();
    expect(address.addresses).toHaveLength(1);
    const sizes = [
      { name: "mobile", width: 390, height: 844 },
      { name: "tablet", width: 768, height: 1024 },
      { name: "desktop", width: 1440, height: 1000 },
    ];
    for (const size of sizes) {
      await page.setViewportSize(size);
      for (const route of [
        "profil",
        "profil/adresler",
        "profil/guvenlik",
        "profil/siparisler",
        "profil/siparisler/" + orderReference,
        "odeme",
      ]) {
        await page.goto(base + "/" + route);
        await expect(page.getByRole("main")).toBeVisible();
        await expect
          .poll(() =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= window.innerWidth,
            ),
          )
          .toBe(true);
        await page.screenshot({
          path: `work/customer-qa/${size.name}-${route.replaceAll("/", "-")}.png`,
          fullPage: true,
        });
      }
    }
    await page.goto(base + "/profil");
    await page.getByRole("button", { name: "Çıkış yap", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Giriş yap", exact: true }),
    ).toBeVisible();
    expect(
      (await (await context.request.get(base + "/api/hesap/session")).json())
        .customer,
    ).toBe(null);
    expect(
      await page.evaluate(() => localStorage.getItem("woya-cart-v1")),
    ).toBe(null);
    await page.goto(base + "/profil/kayit");
    await page.getByLabel("Ad", { exact: true }).fill("Form");
    await page.getByLabel("Soyad", { exact: true }).fill("Test");
    const email = "browser-registration@example.test";
    await page.getByLabel("E-posta", { exact: true }).fill(email);
    await page.getByLabel(/^Şifre/).fill(password);
    await resetLimits();
    await page.getByRole("button", { name: "Kayıt ol", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Bilgiler uygunsa");
    await page.goto(base + "/profil/dogrula#token=" + mailToken(email));
    await page
      .getByLabel("Kayıt sırasında belirlediğiniz şifre")
      .fill(password);
    await page
      .getByRole("button", { name: "E-postayı doğrula", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("İşlem tamamlandı");
    expect(page.url()).not.toContain("token");
    // Keyboard can enter and submit the login form; inspect focus without mouse.
    await page.goto(base + "/profil");
    await page.getByLabel("E-posta", { exact: true }).focus();
    await page.keyboard.type(email);
    await page.keyboard.press("Tab");
    await page.keyboard.type(password);
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("heading", { name: "Profilim", exact: true }),
    ).toBeVisible();
    await page.goto(base + "/");
    await expect(page.getByRole("main")).toBeVisible();
    expect(await page.locator("[data-nextjs-dialog]").count()).toBe(0);
    expect(errors).toEqual([]);
    console.log(
      "PASS browser: registration, token confirmation, keyboard login, logout isolation, home navigation; 390/768/1440 px layouts have no overflow or hydration errors",
    );
  } catch (error) {
    if (diagnosticPage) {
      await diagnosticPage
        .screenshot({ path: "work/customer-qa/failure.png", fullPage: true })
        .catch(() => {});
      await writeFile(
        "work/customer-qa/failure.txt",
        await diagnosticPage.locator("body").innerText(),
      ).catch(() => {});
    }
    throw error;
  } finally {
    await browser.close();
  }
}

// Test-process preload only. Production code has no mock endpoint or bypass.
import "./paytr-provider.mjs";
const originalFetch = globalThis.fetch;
globalThis.fetch = async function (input, init) {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  if (url === "https://api.resend.com/emails") {
    const body = JSON.parse(init.body);
    if (body.to[0] === "provider-fail@example.test")
      return new Response("", { status: 503 });
    const target = new URL(process.env.WOYA_TEST_EMAIL_SINK);
    if (target.hostname !== "127.0.0.1")
      throw new Error("Test sink must be local");
    return originalFetch(target, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
  return originalFetch(input, init);
};

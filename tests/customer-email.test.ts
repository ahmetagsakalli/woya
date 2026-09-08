import { test } from "node:test";
import assert from "node:assert/strict";
import { emailConfiguration, sendAccountEmail } from "../lib/customer/email";
test("missing mail configuration fails explicitly without network or links", async () => {
  process.env.APP_URL = "http://127.0.0.1:3000";
  process.env.CUSTOMER_EMAIL_API_KEY = "";
  process.env.CUSTOMER_EMAIL_FROM = "";
  assert.throws(() => emailConfiguration(), /E-posta hizmeti/);
  await assert.rejects(
    sendAccountEmail("test@example.test", "0".repeat(64), "verify"),
    /E-posta hizmeti/,
  );
});
test("non-HTTPS remote origins cannot carry verification links", () => {
  process.env.APP_URL = "http://unsafe.example.test";
  process.env.CUSTOMER_EMAIL_API_KEY = "test-only";
  process.env.CUSTOMER_EMAIL_FROM = "test@example.test";
  assert.throws(() => emailConfiguration(), /E-posta hizmeti/);
});

import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import readline from "node:readline";
if (!process.stdin.isTTY)
  throw new Error(
    "Şifreyi görünmeden girmek için bu komutu terminalde çalıştırın.",
  );
process.stdout.write("Yeni admin parolası (en az 12 karakter): ");
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
let password = "";
process.stdin.on("keypress", async (text, key) => {
  if (key.ctrl && key.name === "c") process.exit(1);
  if (key.name === "return") {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    if (password.length < 12) {
      console.error("\nParola en az 12 karakter olmalı.");
      process.exit(1);
    }
    const hash = (await bcrypt.hash(password, 12)).replaceAll("$", "\\$");
    console.log(
      `\n# Next.js .env.local icin:\nADMIN_PASSWORD_HASH="${hash}"\nADMIN_SESSION_SECRET="${randomBytes(32).toString("hex")}"`,
    );
  } else if (key.name === "backspace") password = password.slice(0, -1);
  else if (text && !key.ctrl && !key.meta) password += text;
});

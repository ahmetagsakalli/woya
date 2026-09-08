import { z } from "zod";

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifrenizi girin.").max(128),
    newPassword: z
      .string()
      .min(12, "Yeni şifre en az 12 karakter olmalı.")
      .max(72, "Yeni şifre çok uzun.")
      .refine(
        (value) => new TextEncoder().encode(value).length <= 72,
        "Yeni şifre UTF-8 olarak en fazla 72 bayt olabilir.",
      ),
    confirmPassword: z.string().min(1, "Yeni şifrenizi tekrar girin.").max(72),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Yeni şifreler eşleşmiyor.",
  });

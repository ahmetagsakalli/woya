import { redirect } from "next/navigation";
import { pageSession } from "@/lib/customer/auth";
import { SecurityForms } from "../forms";
export const metadata = { title: "Hesap güvenliği" };
export default async function Page() {
  if (!(await pageSession())) redirect("/profil");
  return (
    <>
      <h1>Hesap güvenliği</h1>
      <SecurityForms />
    </>
  );
}

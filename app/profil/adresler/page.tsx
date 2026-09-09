import { redirect } from "next/navigation";
import { pageSession } from "@/lib/customer/auth";
import { addresses } from "@/lib/customer/accounts";
import { AddressBook } from "../forms";
import type { Address } from "@/lib/customer/schema";
export const metadata = { title: "Adreslerim" };
export default async function Page() {
  if (!(await pageSession())) redirect("/profil");
  return (
    <>
      <h1>Adreslerim</h1>
      <AddressBook addresses={(await addresses()) as Address[]} />
    </>
  );
}

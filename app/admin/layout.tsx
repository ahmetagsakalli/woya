import type { Metadata } from "next";
import styles from "./admin.module.css";
export const metadata: Metadata = {
  title: "WOYA Yönetim",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin" },
};
export const dynamic = "force-dynamic";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={styles.root}>{children}</div>;
}

import { protectPage } from "@/lib/admin/auth";
import { AdminNavigation } from "../ui/navigation";
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await protectPage();
  return (
    <div className="admin-shell">
      <AdminNavigation />
      <main className="admin-main" id="admin-content">
        {children}
      </main>
    </div>
  );
}

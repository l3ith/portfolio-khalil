import { requireAdmin } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg)",
        color: "var(--fg)",
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: "100vh",
          overflowY: "auto",
          padding: "32px 40px 80px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

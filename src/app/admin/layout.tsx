import { ProtectedRoute } from "@/features/auth/guards/ProtectedRoute";
import { SidebarProvider } from "@/features/admin/SidebarContext";
import { AdminShell } from "@/features/admin/AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute role="ADMIN">
      <SidebarProvider>
        <AdminShell>{children}</AdminShell>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

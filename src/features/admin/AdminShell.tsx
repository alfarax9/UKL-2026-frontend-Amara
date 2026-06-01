"use client";

import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useSidebar } from "./SidebarContext";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { open, close } = useSidebar();

  return (
    <div className="min-h-screen bg-paper">
      <AdminSidebar open={open} onClose={close} />
      <div className="md:pl-64">{children}</div>
    </div>
  );
}

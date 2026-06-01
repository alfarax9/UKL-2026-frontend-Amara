"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Kelola Menu", href: "/admin/menus", icon: UtensilsCrossed },
  { label: "Kelola Pesanan", href: "/admin/orders", icon: ClipboardList },
];

export function AdminSidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-[2px] md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex-col bg-[#122b24] px-4 py-8 text-white transition-transform duration-300 ease-in-out",
          // Desktop: always visible
          "md:z-30 md:flex md:translate-x-0",
          // Mobile: slide in/out
          open ? "flex translate-x-0" : "-translate-x-full md:flex",
        )}
      >
        <div className="flex items-center justify-between px-3">
          <div>
            <span className="font-serif text-3xl font-bold tracking-[-0.5px]">
              AMARA
            </span>
            <p className="label-eyebrow mt-1 text-[10px] uppercase text-white/50">
              Fine Dining Admin
            </p>
          </div>
          {/* Close button — mobile only */}
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1 border-t border-white/10 pt-4">
          <Link
            href="/admin/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
          >
            <Settings size={18} />
            Settings
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-copper hover:bg-white/5"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}

"use client";

import { CircleUser, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useSidebar } from "@/features/admin/SidebarContext";

export function AdminTopBar({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white px-5 py-4 md:px-8">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          type="button"
          onClick={toggle}
          className="grid size-9 place-items-center rounded-lg text-body hover:bg-black/5 md:hidden"
          aria-label="Buka menu navigasi"
        >
          <Menu size={22} />
        </button>
        <h1 className="font-serif text-2xl font-bold tracking-[-0.4px] text-ink">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Profile Pill */}
        <div className="flex items-center gap-3 rounded-full border border-line/60 bg-paper px-2 py-1.5 shadow-sm transition-colors hover:border-line">
          <div className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
            <CircleUser size={20} />
          </div>
          <div className="hidden text-left sm:block pr-2">
            <p className="text-sm font-bold leading-none text-ink">
              {user?.name ?? "Admin"}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
              Super Admin
            </p>
          </div>
        </div>

        <div className="hidden h-6 w-px bg-line sm:block" aria-hidden />
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 rounded-lg p-2 text-sm font-medium text-body transition-colors hover:bg-red-50 hover:text-red-500"
          title="Sign Out"
        >
          <LogOut size={18} />
          <span className="hidden lg:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}

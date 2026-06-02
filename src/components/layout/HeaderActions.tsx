"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleUser, ChevronDown, LogOut, LayoutDashboard, ShoppingBag } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { CartIcon } from "./CartIcon";

export function HeaderActions() {
  const { user, loading, logout, isGoogleOnly } = useAuth();
  const [open, setOpen] = useState(false);

  // Avoid layout shift / flash while the session is being restored.
  if (loading) {
    return <div className="h-10 w-24" aria-hidden />;
  }

  const firstName = user?.name?.split(" ")[0] ?? "Akun";

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/menu"
        className="hidden rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold tracking-[0.28px] text-white transition-colors hover:bg-primary/90 sm:inline-flex"
      >
        Lihat Menu
      </Link>
      
      <CartIcon />

      {!user ? (
        <Link
          href="/login"
          className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold tracking-[0.28px] text-primary transition-colors hover:bg-primary/5"
        >
          Masuk
        </Link>
      ) : (
        <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {/* Show Google profile photo when available, otherwise fallback icon */}
        {user?.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.picture}
            alt={user.name}
            className="size-6 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <CircleUser size={20} />
        )}
        <span className="max-w-[120px] truncate">{firstName}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          {/* click-away backdrop */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-[0px_8px_24px_rgba(40,65,57,0.15)]"
          >
            <div className="border-b border-line px-4 py-3">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-ink">
                  {user.name}
                </p>
                {isGoogleOnly && (
                  <span className="shrink-0 rounded-full bg-[#e8f0fe] px-1.5 py-0.5 text-[10px] font-semibold text-[#1a73e8]">
                    Google
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted">{user.email}</p>
              {isGoogleOnly && (
                <p className="mt-1 text-[10px] text-muted">
                  Login via Google ·{" "}
                  <span className="text-secondary">fitur terbatas</span>
                </p>
              )}
            </div>

            {user.role === "ADMIN" && (
              <MenuItem href="/admin/dashboard" onClick={() => setOpen(false)}>
                <LayoutDashboard size={18} />
                Dashboard Admin
              </MenuItem>
            )}

            <MenuItem href="/orders" onClick={() => setOpen(false)}>
              <ShoppingBag size={18} />
              Pesanan Saya
            </MenuItem>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut size={18} />
              Keluar
            </button>
          </div>
        </>
      )}
      </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-body transition-colors hover:bg-primary/5"
    >
      {children}
    </Link>
  );
}

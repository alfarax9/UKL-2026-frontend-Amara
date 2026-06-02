"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  FileDown,
  LogOut,
  X,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { cn } from "@/lib/utils";
import { orderService } from "@/lib/api/order.service";
import { exportMonthlySummaryPdf, exportMonthlyOrdersListPdf, exportAllMonthlyBillsPdf } from "@/lib/exportPdf";
import { toast } from "@/lib/toast";
import type { Order } from "@/types/api.types";

const NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Kelola Menu", href: "/admin/menus", icon: UtensilsCrossed },
  { label: "Kelola Pesanan", href: "/admin/orders", icon: ClipboardList },
];

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
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
  const [showExport, setShowExport] = useState(false);
  const [exportMonth, setExportMonth] = useState(new Date().getMonth());
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [exportType, setExportType] = useState<"summary" | "orders" | "bills">("summary");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch ONLY completed orders (paginate through all pages)
      const allOrders: Order[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const result = await orderService.list({ page, limit: 100, status: "COMPLETED" });
        allOrders.push(...result.data);
        hasMore = result.meta.hasNextPage;
        page++;
      }

      // Filter by selected month and year
      const filtered = allOrders.filter((o) => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        return d.getMonth() === exportMonth && d.getFullYear() === exportYear;
      });

      // Validation: Check if there is data to export
      if (filtered.length === 0) {
        toast(`Tidak ada data penjualan selesai (COMPLETED) untuk periode ${MONTH_NAMES[exportMonth]} ${exportYear}.`, "error");
        return;
      }

      if (exportType === "summary") {
        exportMonthlySummaryPdf(allOrders, exportMonth, exportYear);
      } else if (exportType === "orders") {
        exportMonthlyOrdersListPdf(allOrders, exportMonth, exportYear);
      } else {
        exportAllMonthlyBillsPdf(allOrders, exportMonth, exportYear);
      }
      setShowExport(false);
    } catch (err) {
      console.error("Export PDF failed:", err);
      toast("Gagal mengekspor PDF. Pastikan Anda memiliki akses ke data pesanan.", "error");
    } finally {
      setExporting(false);
    }
  };

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
          <Link href="/admin/dashboard" onClick={onClose} className="group">
            <span className="font-serif text-3xl font-bold tracking-[-0.5px] transition-colors group-hover:text-gold">
              AMARA
            </span>
            <p className="label-eyebrow mt-1 text-[10px] uppercase text-white/50">
              Fine Dining Admin
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/60">
                v1.0.0
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                Development
              </span>
            </div>
          </Link>
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
          <button
            type="button"
            onClick={() => setShowExport(true)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
          >
            <FileDown size={18} />
            Export Laporan
          </button>
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

      {/* ── Export Modal ─────────────────────────────────────────────────── */}
      {showExport && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-ink/60 backdrop-blur-sm"
            onClick={() => !exporting && setShowExport(false)}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl border border-line/20 bg-white p-6 shadow-2xl">
              {/* Modal Header */}
              <div className="mb-5 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-primary/10">
                  <FileDown size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-ink">
                    Export Laporan PDF
                  </h3>
                  <p className="text-xs text-muted">
                    Pilih periode laporan penjualan
                  </p>
                </div>
              </div>

              {/* Report Type Selector */}
              <div className="mb-4">
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">
                  Jenis Laporan
                </label>
                <select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value as "summary" | "orders" | "bills")}
                  className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="summary">Ringkasan Menu Terjual (Summary)</option>
                  <option value="orders">Daftar Transaksi Pesanan (Bill Bulanan)</option>
                  <option value="bills">Kumpulan Struk/Bill Bulanan (Satu PDF)</option>
                </select>
              </div>

              {/* Month & Year Selector */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">
                    Bulan
                  </label>
                  <select
                    value={exportMonth}
                    onChange={(e) => setExportMonth(Number(e.target.value))}
                    className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {MONTH_NAMES.map((name, i) => (
                      <option key={i} value={i}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">
                    Tahun
                  </label>
                  <select
                    value={exportYear}
                    onChange={(e) => setExportYear(Number(e.target.value))}
                    className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
                      (yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>

              {/* Info */}
              <div className="mt-4 rounded-lg bg-paper p-3">
                <p className="text-xs text-muted">
                  {exportType === "summary" ? (
                    <>
                      📄 Laporan akan mencakup: total penjualan tiap menu, omset kotor, pajak
                      restoran (10%), dan omset bersih untuk periode{" "}
                      <span className="font-semibold text-ink">
                        {MONTH_NAMES[exportMonth]} {exportYear}
                      </span>.
                    </>
                  ) : exportType === "orders" ? (
                    <>
                      📄 Laporan akan mencakup: daftar seluruh transaksi pesanan selesai,
                      nomor meja, nama pelanggan, omset kotor, pajak restoran (10%), dan omset bersih untuk periode{" "}
                      <span className="font-semibold text-ink">
                        {MONTH_NAMES[exportMonth]} {exportYear}
                      </span>.
                    </>
                  ) : (
                    <>
                      📄 Laporan akan mencakup: penggabungan seluruh struk/bill pesanan selesai
                      dalam bentuk halaman-halaman struk di satu berkas PDF untuk periode{" "}
                      <span className="font-semibold text-ink">
                        {MONTH_NAMES[exportMonth]} {exportYear}
                      </span>.
                    </>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowExport(false)}
                  disabled={exporting}
                  className="flex-1 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-body transition-colors hover:bg-paper disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {exporting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <FileDown size={16} />
                      Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}


"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  Receipt,
  ClipboardList,
  ChevronDown,
} from "lucide-react";
import { exportUserBillsByDays } from "@/lib/exportPdf";
import {
  useOrderHistory,
  orderCode,
  type SavedOrder,
} from "@/features/order/history";
import { useCart } from "@/features/cart/store";
import { MenuImage } from "@/components/shared/MenuImage";
import { useHasMounted, formatRupiah, cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import type { OrderStatus } from "@/types/api.types";

const STATUS: Record<
  OrderStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  COMPLETED: { label: "Selesai", className: "bg-[#d7e8ca] text-[#5a6951]", icon: CheckCircle2 },
  PAID: { label: "Dibayar", className: "bg-[#d7e8ca] text-[#5a6951]", icon: CheckCircle2 },
  PROCESSING: { label: "Sedang Diproses", className: "bg-footer text-body", icon: Clock },
  PENDING: { label: "Menunggu Pembayaran", className: "bg-gold/30 text-copper", icon: Clock },
  CANCELLED: { label: "Dibatalkan", className: "bg-red-100 text-red-600", icon: Clock },
};

const PERIOD_OPTIONS = [
  { days: 1, label: "1 Hari Terakhir" },
  { days: 15, label: "15 Hari Terakhir" },
  { days: 30, label: "30 Hari Terakhir" },
];

const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function OrderHistoryView() {
  const mounted = useHasMounted();
  const orders = useOrderHistory((s) => s.orders);

  if (!mounted) return <div className="min-h-[60vh]" />;

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-12 md:px-10">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-footer pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-[-0.64px] text-primary">
            Riwayat Pesanan
          </h1>
          <p className="text-lg text-body">Menelusuri kenangan kuliner Anda</p>
        </div>

        {orders.length > 0 && <DownloadDropdown orders={orders} />}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Receipt size={40} className="text-secondary" />
          <p className="font-serif text-2xl text-ink">Belum ada pesanan</p>
          <p className="text-sm text-body">
            Pesanan yang Anda buat akan muncul di sini.
          </p>
          <Link
            href="/menu"
            className="mt-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Mulai Memesan
          </Link>
        </div>
      ) : (
        <div className="mt-10 flex flex-col gap-10">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Download Dropdown ─────────────────────────────────────────────────────── */

function DownloadDropdown({ orders }: { orders: SavedOrder[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleDownload = (days: number) => {
    setOpen(false);
    exportUserBillsByDays(orders, days);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-lg border border-primary bg-white px-4 py-2.5 text-sm font-semibold tracking-[0.28px] text-primary shadow-sm transition-colors hover:bg-primary/5"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <ClipboardList size={16} />
        <span className="hidden sm:inline">Download Riwayat</span>
        <span className="sm:hidden">Download</span>
        <ChevronDown
          size={14}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-[0px_8px_24px_rgba(40,65,57,0.15)]"
        >
          <div className="border-b border-line px-4 py-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Pilih Periode
            </p>
          </div>
          {PERIOD_OPTIONS.map(({ days, label }) => (
            <button
              key={days}
              type="button"
              role="menuitem"
              onClick={() => handleDownload(days)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-ink transition-colors hover:bg-primary/5"
            >
              <ClipboardList size={16} className="shrink-0 text-primary" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Order Card ────────────────────────────────────────────────────────────── */

function OrderCard({ order }: { order: SavedOrder }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const status = STATUS[order.status] ?? STATUS.PENDING;
  const StatusIcon = status.icon;

  const title =
    order.items.length === 1
      ? order.items[0].name
      : `${order.items[0].name} +${order.items.length - 1} lainnya`;

  const reorder = () => {
    order.items.forEach((i) =>
      add(
        { id: i.menuId, name: i.name, price: i.price, imageUrl: i.imageUrl },
        i.quantity,
      ),
    );
    toast("Item ditambahkan ke keranjang");
    router.push("/cart");
  };

  return (
    <article className="relative rounded-xl border border-[#e9e8e6] bg-white p-6 shadow-[0px_4px_24px_0px_rgba(40,65,57,0.08)] md:p-10">
      {/* Status badge */}
      <span
        className={cn(
          "label-eyebrow absolute right-6 top-6 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
          status.className,
        )}
      >
        <StatusIcon size={13} />
        {status.label}
      </span>

      {/* Header */}
      <p className="label-eyebrow text-xs font-medium text-body">
        {dateFmt(order.createdAt)} • {orderCode(order.id)}
      </p>
      <h2 className="mt-1 font-serif text-2xl text-ink">{title}</h2>

      {/* Items */}
      <ul className="my-6 flex flex-col gap-4 border-y border-footer py-6">
        {order.items.map((item, i) => (
          <li key={i} className="flex items-center gap-6">
            <div className="size-16 shrink-0 overflow-hidden rounded-lg">
              <MenuImage src={item.imageUrl} alt={item.name} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-ink">{item.name}</p>
              <p className="text-sm text-body">
                {item.quantity}x • {formatRupiah(item.price)}
              </p>
            </div>
            <span className="whitespace-nowrap text-[16px] text-ink">
              {formatRupiah(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[16px] text-body">Total Pesanan</span>
          <span className="font-serif text-xl text-ink">
            {formatRupiah(order.total)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/order/${order.id}`}
            className="rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold tracking-[0.28px] text-primary hover:bg-primary/5"
          >
            Lacak
          </Link>
          {order.status === "PENDING" && order.paymentMethod !== "cash" && (
            <Link
              href={`/payment/${order.paymentMethod}/${order.id}`}
              className="rounded-lg border border-copper px-5 py-2.5 text-sm font-semibold tracking-[0.28px] text-copper hover:bg-copper/5"
            >
              Bayar
            </Link>
          )}
          <button
            type="button"
            onClick={reorder}
            className="inline-flex items-center gap-2 rounded-lg bg-copper px-6 py-3 text-sm font-semibold tracking-[0.28px] text-white transition-colors hover:bg-copper/90"
          >
            <RotateCcw size={14} />
            Pesan Lagi
          </button>
        </div>
      </div>
    </article>
  );
}

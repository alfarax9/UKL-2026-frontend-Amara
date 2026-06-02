"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Check, Clock, ChefHat, CircleCheck, XCircle, ArrowLeft, FileDown } from "lucide-react";
import { orderService } from "@/lib/api/order.service";
import { exportSingleOrderBillPdf } from "@/lib/exportPdf";
import { orderCode } from "@/features/order/history";
import { formatRupiah, cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/api.types";

const STEPS: { status: OrderStatus; label: string; icon: typeof Check }[] = [
  { status: "PENDING", label: "Pesanan Dibuat", icon: Clock },
  { status: "PAID", label: "Pembayaran Diterima", icon: Check },
  { status: "PROCESSING", label: "Sedang Disiapkan", icon: ChefHat },
  { status: "COMPLETED", label: "Selesai", icon: CircleCheck },
];

export function OrderTrackView({ orderId }: { orderId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["track", orderId],
    queryFn: () => orderService.track(orderId),
    refetchInterval: 15000,
  });

  if (isLoading)
    return <div className="py-24 text-center text-muted">Memuat pesanan…</div>;
  if (isError || !data)
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <p className="font-serif text-2xl text-ink">Pesanan tidak ditemukan</p>
        <Link href="/orders" className="mt-4 inline-block text-copper underline">
          Lihat riwayat pesanan
        </Link>
      </div>
    );

  const cancelled = data.status === "CANCELLED";
  const currentIdx = STEPS.findIndex((s) => s.status === data.status);

  return (
    <div className="mx-auto max-w-[760px] px-5 py-12 md:px-10">
      <Link
        href="/orders"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-body hover:text-primary"
      >
        <ArrowLeft size={16} />
        Riwayat Pesanan
      </Link>

      <div className="rounded-2xl border border-line/40 bg-white p-6 md:p-10">
        <div className="flex flex-col justify-between gap-4 border-b border-line/10 pb-6 sm:flex-row sm:items-start">
          <div>
            <p className="label-eyebrow text-xs uppercase text-muted">
              {orderCode(data.id)}
            </p>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-[-0.5px] text-ink">
              Lacak Pesanan
            </h1>
            <p className="mt-1 text-body">
              {data.customerName} • Meja {data.tableNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={() => exportSingleOrderBillPdf(data)}
            className="inline-flex items-center gap-2 rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold tracking-[0.28px] text-primary hover:bg-primary/5 self-start"
          >
            <FileDown size={14} />
            Cetak Bill
          </button>
        </div>

        {/* Timeline */}
        {cancelled ? (
          <div className="mt-8 flex items-center gap-3 rounded-xl bg-red-50 p-5 text-red-600">
            <XCircle size={24} />
            <span className="font-semibold">Pesanan dibatalkan</span>
          </div>
        ) : (
          <ol className="mt-8 space-y-0">
            {STEPS.map((step, i) => {
              const done = i <= currentIdx;
              const active = i === currentIdx;
              const Icon = step.icon;
              const last = i === STEPS.length - 1;
              return (
                <li key={step.status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-full border-2 transition-colors",
                        done
                          ? "border-primary bg-primary text-white"
                          : "border-line bg-white text-muted",
                      )}
                    >
                      <Icon size={18} />
                    </span>
                    {!last && (
                      <span
                        className={cn(
                          "my-1 w-0.5 flex-1 grow",
                          done ? "bg-primary" : "bg-line",
                        )}
                        style={{ minHeight: 32 }}
                      />
                    )}
                  </div>
                  <div className={cn("pb-8", last && "pb-0")}>
                    <p
                      className={cn(
                        "font-semibold",
                        active ? "text-primary" : done ? "text-ink" : "text-muted",
                      )}
                    >
                      {step.label}
                    </p>
                    {active && (
                      <p className="text-sm text-secondary">Status saat ini</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {/* Items */}
        <div className="mt-8 border-t border-line/60 pt-6">
          <p className="label-eyebrow mb-3 text-[11px] uppercase text-muted">
            Daftar Menu
          </p>
          <ul className="space-y-3">
            {data.orderItems?.map((it) => (
              <li key={it.id} className="flex items-center justify-between">
                <span className="text-ink">
                  {it.menu?.name ?? "Menu"}{" "}
                  <span className="text-muted">×{it.quantity}</span>
                </span>
                <span className="text-ink">
                  {formatRupiah(Number(it.price) * it.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-4">
            <span className="font-serif text-lg font-bold text-primary">Total</span>
            <span className="font-serif text-lg font-bold text-ink">
              {formatRupiah(Number(data.totalPrice ?? 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

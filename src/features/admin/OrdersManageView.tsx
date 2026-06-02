"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, X, ChevronLeft, ChevronRight, Loader2, FileDown } from "lucide-react";
import { orderService } from "@/lib/api/order.service";
import { exportSingleOrderBillPdf } from "@/lib/exportPdf";
import { AdminTopBar } from "@/components/layout/AdminTopBar";
import { ORDER_STATUS, ALL_STATUSES } from "./orderStatus";
import { formatRupiah, cn } from "@/lib/utils";
import { orderCode } from "@/features/order/history";
import { toast } from "@/lib/toast";
import type { Order, OrderStatus } from "@/types/api.types";

const PAGE_SIZE = 10;

// Which status a primary action transitions to.
const NEXT_ACTION: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  PENDING: { to: "PAID", label: "Verifikasi Pembayaran" },
  PAID: { to: "PROCESSING", label: "Tandai Diproses" },
  PROCESSING: { to: "COMPLETED", label: "Tandai Selesai" },
};

export function OrdersManageView() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders", status, page],
    queryFn: () =>
      orderService.list({
        page,
        limit: PAGE_SIZE,
        status: status ?? undefined,
      }),
  });

  const mutation = useMutation({
    mutationFn: ({ id, to }: { id: string; to: OrderStatus }) =>
      orderService.updateStatus(id, to),
    onSuccess: (updated) => {
      toast(`Status diubah ke ${ORDER_STATUS[updated.status].label}`);
      setSelected((s) => (s ? { ...s, status: updated.status } : s));
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: () => toast("Gagal mengubah status", "error"),
  });

  const rows = (data?.data ?? []).filter((o) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      o.customerName.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      orderCode(o.id).toLowerCase().includes(q)
    );
  });
  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <>
      <AdminTopBar title="Kelola Pesanan" />
      <div className="p-5 md:p-8">
        {/* Search */}
        <div className="relative mb-5 max-w-md">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID pesanan atau pelanggan…"
            className="w-full rounded-lg border border-line bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Filter tabs */}
        <div className="mb-5 flex flex-wrap gap-2">
          <FilterTab active={status === null} onClick={() => { setStatus(null); setPage(1); }}>
            Semua
          </FilterTab>
          {ALL_STATUSES.map((s) => (
            <FilterTab
              key={s}
              active={status === s}
              onClick={() => { setStatus(s); setPage(1); }}
            >
              {ORDER_STATUS[s].label}
            </FilterTab>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-line/40 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line/60 text-xs uppercase tracking-wide text-muted">
                <th className="p-4 font-medium">ID Pesanan</th>
                <th className="p-4 font-medium">Pelanggan</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-muted">
                    Memuat…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-muted">
                    Tidak ada pesanan.
                  </td>
                </tr>
              ) : (
                rows.map((o) => {
                  const st = ORDER_STATUS[o.status];
                  return (
                    <tr key={o.id} className="border-b border-line/30 last:border-0">
                      <td className="p-4 font-mono text-xs text-body">
                        {orderCode(o.id)}
                      </td>
                      <td className="p-4 text-ink">{o.customerName}</td>
                      <td className="p-4 text-ink">
                        {formatRupiah(Number(o.totalPrice ?? 0))}
                      </td>
                      <td className="p-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${st.badge}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => setSelected(o)}
                          className="text-sm font-semibold text-copper hover:underline"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <span>
            Halaman {data?.meta.currentPage ?? 1} dari {totalPages}
          </span>
          <div className="flex gap-2">
            <PageBtn disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={16} />
            </PageBtn>
            <PageBtn
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={16} />
            </PageBtn>
          </div>
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <OrderDrawer
          order={selected}
          onClose={() => setSelected(null)}
          onUpdate={(to) => mutation.mutate({ id: selected.id, to })}
          updating={mutation.isPending}
        />
      )}
    </>
  );
}

function OrderDrawer({
  order,
  onClose,
  onUpdate,
  updating,
}: {
  order: Order;
  onClose: () => void;
  onUpdate: (to: OrderStatus) => void;
  updating: boolean;
}) {
  const st = ORDER_STATUS[order.status];
  const next = NEXT_ACTION[order.status];
  const canCancel = order.status !== "COMPLETED" && order.status !== "CANCELLED";

  return (
    <>
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/30"
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line p-5">
          <div>
            <h2 className="font-serif text-xl font-bold text-ink">
              Detail Pesanan
            </h2>
            <p className="font-mono text-xs text-muted">{orderCode(order.id)}</p>
          </div>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-6 p-5">
          <div>
            <p className="label-eyebrow text-[11px] uppercase text-muted">
              Informasi Pelanggan
            </p>
            <p className="mt-1 font-semibold text-ink">{order.customerName}</p>
            <p className="text-sm text-body">Meja: {order.tableNumber}</p>
            {order.notes && (
              <p className="mt-1 text-sm text-body">Catatan: {order.notes}</p>
            )}
          </div>

          <div>
            <p className="label-eyebrow mb-2 text-[11px] uppercase text-muted">
              Daftar Menu
            </p>
            <ul className="space-y-3">
              {order.orderItems?.map((it) => (
                <li key={it.id} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-ink">
                    {it.menu?.name ?? "Menu"}{" "}
                    <span className="text-muted">×{it.quantity}</span>
                  </span>
                  <span className="text-sm text-ink">
                    {formatRupiah(Number(it.price) * it.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between border-t border-line pt-4">
            <span className="text-body">Total</span>
            <span className="font-serif text-xl font-bold text-ink">
              {formatRupiah(Number(order.totalPrice ?? 0))}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-body">Status:</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${st.badge}`}>
              {st.label}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 border-t border-line p-5">
          <button
            type="button"
            onClick={() => exportSingleOrderBillPdf(order)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary py-3 text-sm font-semibold text-primary hover:bg-primary/5"
          >
            <FileDown size={16} />
            Cetak Bill (PDF)
          </button>
          {next && (
            <button
              type="button"
              disabled={updating}
              onClick={() => onUpdate(next.to)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {updating && <Loader2 size={16} className="animate-spin" />}
              {next.label}
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              disabled={updating}
              onClick={() => onUpdate("CANCELLED")}
              className="w-full rounded-lg border border-red-300 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Batalkan Pesanan
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        active ? "bg-primary text-white" : "bg-black/5 text-body hover:bg-black/10",
      )}
    >
      {children}
    </button>
  );
}

function PageBtn({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-lg border border-line bg-white text-body disabled:opacity-40"
    >
      {children}
    </button>
  );
}

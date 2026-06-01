"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { menuService } from "@/lib/api/menu.service";
import { categoryService } from "@/lib/api/category.service";
import { AdminTopBar } from "@/components/layout/AdminTopBar";
import { MenuImage } from "@/components/shared/MenuImage";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { CategoryFilterBar } from "@/components/ui/CategoryFilterBar";
import { DeleteMenuModal } from "@/components/ui/DeleteMenuModal";
import { useImageUpload } from "@/lib/useImageUpload";
import { formatRupiah } from "@/lib/utils";
import { toast } from "@/lib/toast";
import type { Menu } from "@/types/api.types";

export function MenuManageView() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [editing, setEditing] = useState<Menu | null | undefined>(undefined); // undefined=closed, null=new
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null);

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.list,
  });

  const menus = useQuery({
    queryKey: ["admin", "menus", search, categoryId],
    queryFn: () =>
      menuService.list({
        limit: 50,
        search: search || undefined,
        categoryId: categoryId || undefined,
      }),
  });

  const del = useMutation({
    mutationFn: (id: string) => menuService.remove(id),
    onSuccess: () => {
      toast("Menu dihapus");
      qc.invalidateQueries({ queryKey: ["admin", "menus"] });
      qc.invalidateQueries({ queryKey: ["menus"] });
    },
    onError: () => toast("Gagal menghapus menu", "error"),
  });

  const rows = menus.data?.data ?? [];

  return (
    <>
      <AdminTopBar title="Kelola Menu" />
      <div className="p-5 md:p-8">
        {/* Controls */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari menu…"
              className="w-full rounded-lg border border-line bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-maroon px-5 py-2.5 text-sm font-semibold text-white hover:bg-maroon/90"
          >
            <Plus size={18} />
            Tambah Menu
          </button>
        </div>

        {/* Category filter pills */}
        <CategoryFilterBar
          categories={categories.data ?? []}
          value={categoryId}
          onChange={setCategoryId}
          loading={categories.isLoading}
          className="mb-5"
        />

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-line/40 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line/60 text-xs uppercase tracking-wide text-muted">
                <th className="p-4 font-medium">Foto</th>
                <th className="p-4 font-medium">Nama Menu</th>
                <th className="p-4 font-medium">Kategori</th>
                <th className="p-4 font-medium">Harga</th>
                <th className="p-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {menus.isLoading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-muted">
                    Memuat…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-muted">
                    Tidak ada menu.
                  </td>
                </tr>
              ) : (
                rows.map((m) => (
                  <tr key={m.id} className="border-b border-line/30 last:border-0">
                    <td className="p-4">
                      <div className="size-14 overflow-hidden rounded-lg">
                        <MenuImage src={m.imageUrl} menuId={m.id} alt={m.name} />
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-serif text-base text-ink">{m.name}</p>
                      {m.description && (
                        <p className="line-clamp-1 max-w-xs text-xs text-muted">
                          {m.description}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      {m.category && (
                        <span className="rounded-full bg-secondary/15 px-2.5 py-1 text-xs font-medium text-secondary">
                          {m.category.name}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-ink">{formatRupiah(m.price)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(m)}
                          className="grid size-9 place-items-center rounded-lg border border-line text-body hover:text-primary"
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(m)}
                          className="grid size-9 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                          aria-label="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing !== undefined && (
        <MenuFormModal
          menu={editing}
          categories={categories.data ?? []}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            qc.invalidateQueries({ queryKey: ["admin", "menus"] });
            qc.invalidateQueries({ queryKey: ["menus"] });
          }}
        />
      )}

      {/* Delete confirmation popup */}
      <DeleteMenuModal
        open={!!deleteTarget}
        menuName={deleteTarget?.name ?? ""}
        loading={del.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            del.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            });
          }
        }}
        onCancel={() => !del.isPending && setDeleteTarget(null)}
      />
    </>
  );
}

function MenuFormModal({
  menu,
  categories,
  onClose,
  onSaved,
}: {
  menu: Menu | null;
  categories: { id: string; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(menu?.name ?? "");
  const [description, setDescription] = useState(menu?.description ?? "");
  const [price, setPrice] = useState(menu ? String(menu.price) : "");
  const [catId, setCatId] = useState(menu?.categoryId ?? categories[0]?.id ?? "");
  const [isAvailable, setIsAvailable] = useState(menu?.isAvailable ?? true);
  const [saving, setSaving] = useState(false);

  // ── Cloudinary upload hook ────────────────────────────────────────────────
  const imgHook = useImageUpload("amara/menus");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !catId) {
      toast("Nama, harga, dan kategori wajib diisi", "error");
      return;
    }
    if (imgHook.state.uploading) {
      toast("Tunggu upload gambar selesai", "error");
      return;
    }

    setSaving(true);
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("description", description);
      form.append("price", price);
      form.append("isAvailable", String(isAvailable));
      form.append("categoryId", catId);

      // Backend hanya menerima field `image` (File), bukan `imageUrl` (string).
      // Kita kirim file asli; Cloudinary URL disimpan di cache lokal untuk ditampilkan.
      if (imgHook.state.file) {
        form.append("image", imgHook.state.file);
      }

      if (menu) await menuService.update(menu.id, form);
      else await menuService.create(form);

      toast(menu ? "Menu diperbarui" : "Menu ditambahkan");
      onSaved();
    } catch {
      toast("Gagal menyimpan menu", "error");
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/40"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <form
          onSubmit={submit}
          className="max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-ink">
              {menu ? "Edit Menu" : "Tambah Menu Baru"}
            </h2>
            <button type="button" onClick={onClose} className="text-muted hover:text-ink">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <Labeled label="Nama Menu">
              <input value={name} onChange={(e) => setName(e.target.value)} className={inp} />
            </Labeled>
            <Labeled label="Deskripsi">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={`${inp} resize-none`}
              />
            </Labeled>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Labeled label="Harga (Rp)">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={inp}
                />
              </Labeled>
              <Labeled label="Kategori">
                <select value={catId} onChange={(e) => setCatId(e.target.value)} className={inp}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Labeled>
            </div>

            <ImageUploadField
              hook={imgHook}
              currentUrl={menu?.imageUrl}
              label="Gambar Menu"
            />

            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="size-4 accent-primary"
              />
              Tersedia
            </label>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-line py-3 text-sm font-semibold text-body hover:bg-black/5"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {menu ? "Simpan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

const inp =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20";

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="label-eyebrow text-[11px] uppercase text-body">{label}</span>
      {children}
    </label>
  );
}

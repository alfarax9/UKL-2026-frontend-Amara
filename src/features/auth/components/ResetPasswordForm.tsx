"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { authService } from "@/lib/api/auth.service";
import { toast } from "@/lib/toast";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      return toast("Token reset password tidak valid atau tidak ditemukan.", "error");
    }

    if (newPassword.length < 8) {
      return toast("Password minimal 8 karakter.", "error");
    }

    if (newPassword !== confirmPassword) {
      return toast("Konfirmasi password tidak cocok.", "error");
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      toast("Password berhasil diubah. Silakan masuk kembali.");
      router.push("/login");
    } catch (error: any) {
      toast(error?.response?.data?.message || "Gagal mereset password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="label-eyebrow text-xs font-bold uppercase tracking-[1px] text-body">
          Password Baru
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-line bg-paper/50 px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="mt-0.5 px-1 text-[11px] italic text-muted">Minimal 8 karakter</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="label-eyebrow text-xs font-bold uppercase tracking-[1px] text-body">
          Konfirmasi Password
        </label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-line bg-paper/50 px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#b66642] py-3.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-copper disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Simpan Password
      </button>
    </form>
  );
}

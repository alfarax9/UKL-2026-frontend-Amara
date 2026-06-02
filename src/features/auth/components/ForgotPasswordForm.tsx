"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { authService } from "@/lib/api/auth.service";
import { toast } from "@/lib/toast";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast("Email wajib diisi", "error");

    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSuccess(true);
      toast("Instruksi telah dikirim ke email Anda");
    } catch (error: any) {
      toast(error?.response?.data?.message || "Gagal mengirim permintaan", "error");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-lg border border-copper bg-copper/5 p-6 text-center">
        <p className="text-sm font-semibold text-copper">
          Link reset password telah dikirim ke {email}.
        </p>
        <p className="mt-2 text-xs text-body">
          Silakan periksa kotak masuk atau folder spam Anda.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="label-eyebrow text-xs font-bold uppercase tracking-[1px] text-body">
          Email
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
          className="w-full rounded-lg border border-line bg-paper/50 px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#b66642] py-3.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-copper disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Kirim Link Reset
      </button>
    </form>
  );
}

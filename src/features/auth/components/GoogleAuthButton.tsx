"use client";

import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { setToken, GOOGLE_SESSION_KEY } from "@/lib/api/client";
import { useAuth } from "../context/AuthContext";
import { toast } from "@/lib/toast";
import { env } from "@/config/env";

/**
 * Google Sign-In button.
 *
 * Flow:
 * 1. Kirim Google ID token ke API route server-side `/api/auth/google`
 * 2. Server verifikasi ke Google, coba teruskan ke Amara backend
 * 3a. Jika Amara backend mendukung → dapat accessToken → sesi penuh
 * 3b. Jika belum → dapat data user dari Google → sesi lokal (Google-only)
 *
 * Hanya render tombol asli Google bila Client ID & feature flag aktif.
 */
export function GoogleAuthButton() {
  const router = useRouter();
  const { refresh } = useAuth();

  const enabled = env.enableGoogleAuth && !!env.googleClientId;

  if (!enabled) {
    return (
      <button
        type="button"
        disabled
        title="Google login belum dikonfigurasi"
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-line bg-white py-3 text-sm font-medium text-muted"
      >
        <GoogleGlyph />
        Lanjutkan dengan Google
      </button>
    );
  }

  const handleSuccess = async (cred: { credential?: string }) => {
    if (!cred.credential) return;

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: cred.credential }),
      });

      const data = (await res.json()) as {
        source?: "amara" | "google";
        accessToken?: string;
        user?: {
          id: string;
          name: string;
          email: string;
          picture?: string | null;
          role: "ADMIN" | "USER";
        };
        error?: string;
      };

      if (!res.ok || data.error) {
        toast(data.error ?? "Google login gagal", "error");
        return;
      }

      if (data.source === "amara" && data.accessToken) {
        // Full session — simpan Amara JWT
        setToken(data.accessToken);
        await refresh();
        router.push(data.user?.role === "ADMIN" ? "/admin/dashboard" : "/");
        toast(`Selamat datang, ${data.user?.name ?? ""}!`);
      } else if (data.source === "google" && data.user) {
        // Fallback: Google-only session (belum ada endpoint backend)
        const googleUser = { ...data.user, authSource: "google" as const };
        localStorage.setItem(GOOGLE_SESSION_KEY, JSON.stringify(googleUser));
        await refresh();
        router.push("/");
        toast(`Masuk sebagai ${data.user.name} (Google)`);
      }
    } catch {
      toast("Terjadi kesalahan saat login dengan Google", "error");
    }
  };

  return (
    <div className="w-full [&>div]:!w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast("Google login gagal", "error")}
        logo_alignment="center"
        text="continue_with"
        shape="rectangular"
      />
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.94H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.06l3.01-2.34Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

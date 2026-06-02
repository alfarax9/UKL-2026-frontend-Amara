"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api/auth.service";
import { getToken, GOOGLE_SESSION_KEY } from "@/lib/api/client";
import type { User, LoginDto, RegisterDto } from "@/types/api.types";
import { useOrderHistory } from "@/features/order/history";

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isGoogleOnly: boolean; // true = logged in via Google only (no Amara JWT)
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/** Read the persisted Google-only session from localStorage. */
function getGoogleSession(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GOOGLE_SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    // ── 1. Try Amara JWT first ────────────────────────────────────────────────
    if (getToken()) {
      try {
        const u = await authService.me();
        setUser({ ...u, authSource: "amara" });
        return;
      } catch {
        // Token invalid — fall through to Google session
      }
    }
    // ── 2. Fall back to Google-only session ───────────────────────────────────
    const googleUser = getGoogleSession();
    if (googleUser) {
      setUser(googleUser);
      return;
    }
    setUser(null);
  }, []);

  // Restore session once on mount.
  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- session restore
    refresh().finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [refresh]);

  const login = async (dto: LoginDto) => {
    await authService.login(dto);
    // Clear local guest order history on login
    useOrderHistory.getState().clearOrders();
    await refresh();
  };

  const register = async (dto: RegisterDto) => {
    await authService.register(dto);
  };

  const logout = () => {
    authService.logout();
    // Also clear Google session
    if (typeof window !== "undefined") {
      localStorage.removeItem(GOOGLE_SESSION_KEY);
    }
    // Clear local guest order history on logout
    useOrderHistory.getState().clearOrders();
    setUser(null);
    router.push("/login");
  };

  const isGoogleOnly =
    !!user && user.authSource === "google";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isGoogleOnly,
        login,
        register,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}

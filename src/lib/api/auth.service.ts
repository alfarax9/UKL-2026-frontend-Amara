import { api, setToken, clearToken } from "./client";
import type {
  ApiResponse,
  AuthData,
  User,
  LoginDto,
  RegisterDto,
} from "@/types/api.types";

export const authService = {
  async register(dto: RegisterDto) {
    const { data } = await api.post<ApiResponse<AuthData>>(
      "/auth/register",
      dto,
    );
    return data.data;
  },

  async login(dto: LoginDto) {
    const { data } = await api.post<ApiResponse<AuthData>>("/auth/login", dto);
    // Token lives at data.data.accessToken (verified against the live API).
    setToken(data.data.accessToken);
    return data.data;
  },

  /** Exchange a Google ID token for an Amara JWT (requires backend support). */
  async google(idToken: string) {
    const { data } = await api.post<ApiResponse<AuthData>>("/auth/google", {
      idToken,
    });
    setToken(data.data.accessToken);
    return data.data;
  },

  async me() {
    const { data } = await api.get<ApiResponse<User>>("/auth/me");
    return data.data;
  },

  async forgotPassword(email: string) {
    const { data } = await api.post<ApiResponse<void>>("/auth/forgot-password", { email });
    return data;
  },

  async resetPassword(token: string, newPassword: string) {
    const { data } = await api.post<ApiResponse<void>>("/auth/reset-password", { token, newPassword });
    return data;
  },

  logout() {
    clearToken();
  },
};

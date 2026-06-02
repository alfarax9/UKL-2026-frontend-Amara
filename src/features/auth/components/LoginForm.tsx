"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail } from "lucide-react";
import { TextField } from "@/components/ui/TextField";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/Button";
import { authService } from "@/lib/api/auth.service";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});
type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const { user } = await authService.login(values);
      await refresh();
      router.push(user.role === "ADMIN" ? "/admin/dashboard" : "/");
    } catch {
      setServerError("Email atau password salah.");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
      <TextField
        label="Email"
        type="email"
        placeholder="nama@email.com"
        leftIcon={<Mail size={18} />}
        error={errors.email?.message}
        {...register("email")}
      />
      <div className="flex flex-col gap-1">
        <PasswordField
          label="Password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        <Link
          href="/forgot-password"
          className="label-eyebrow self-end text-xs font-medium text-secondary hover:text-primary"
        >
          Lupa password?
        </Link>
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <Button
        type="submit"
        variant="maroon"
        size="md"
        fullWidth
        disabled={isSubmitting}
      >
        {isSubmitting ? "Memproses…" : "Masuk"}
      </Button>
    </form>
  );
}

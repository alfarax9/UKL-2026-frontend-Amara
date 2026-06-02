import { Suspense } from "react";
import { PasswordCard } from "@/features/auth/components/PasswordCard";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <PasswordCard
      title="Buat Password Baru"
      subtitle="Silakan masukkan kombinasi kata sandi baru Anda."
      backLinkText="Kembali ke Halaman Login"
      showBackArrow={false}
    >
      <Suspense fallback={<div className="h-40 w-full animate-pulse rounded-lg bg-line/20" />}>
        <ResetPasswordForm />
      </Suspense>
    </PasswordCard>
  );
}

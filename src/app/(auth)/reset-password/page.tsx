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
      <ResetPasswordForm />
    </PasswordCard>
  );
}

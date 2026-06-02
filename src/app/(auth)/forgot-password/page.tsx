import { PasswordCard } from "@/features/auth/components/PasswordCard";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <PasswordCard
      title="Lupa Password"
      subtitle="Masukkan email kamu, kami akan kirim link untuk reset password."
      backLinkText="Kembali ke halaman Masuk"
      showBackArrow={true}
    >
      <ForgotPasswordForm />
    </PasswordCard>
  );
}

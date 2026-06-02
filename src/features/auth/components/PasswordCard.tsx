import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function PasswordCard({
  title,
  subtitle,
  children,
  backLinkText,
  backLinkHref = "/login",
  showBackArrow = false,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  backLinkText: string;
  backLinkHref?: string;
  showBackArrow?: boolean;
}) {
  return (
    <div className="relative z-10 flex w-full max-w-[480px] flex-col gap-6 rounded-2xl bg-paper px-6 pb-10 pt-12 shadow-[0px_8px_24px_rgba(40,65,57,0.15)] sm:px-10">
      {/* Logo */}
      <div className="flex flex-col items-center">
        <span className="font-serif text-[40px] font-bold tracking-[-0.96px] text-ink sm:text-[48px]">
          AMARA
        </span>
      </div>

      <div className="text-center">
        <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-body">{subtitle}</p>
      </div>

      {children}

      <div className="mt-2 flex justify-center">
        <Link
          href={backLinkHref}
          className="flex items-center gap-2 text-sm font-bold text-ink transition-colors hover:text-copper"
        >
          {showBackArrow && <ArrowLeft size={16} />}
          {backLinkText}
        </Link>
      </div>
    </div>
  );
}

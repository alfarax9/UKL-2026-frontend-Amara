import Link from "next/link";
import { Camera, Globe, Send } from "lucide-react";

const LINKS = [
  { label: "Privasi", href: "/privacy" },
  { label: "Syarat & Ketentuan", href: "/terms" },
  { label: "Lokasi", href: "/contact" },
  { label: "Karir", href: "/careers" },
];

export function LandingFooter() {
  return (
    <footer className="w-full bg-primary text-white">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-5 py-12 md:flex-row md:justify-between md:px-20">
        <span className="font-serif text-[40px] font-bold tracking-[-0.96px]">
          AMARA
        </span>

        <nav className="flex flex-wrap items-center justify-center gap-6">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[16px] text-white/80 transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-white/90">
          <Link href="#" aria-label="Instagram" className="hover:text-gold">
            <Camera size={20} />
          </Link>
          <Link href="#" aria-label="Website" className="hover:text-gold">
            <Globe size={20} />
          </Link>
          <Link href="#" aria-label="Contact" className="hover:text-gold">
            <Send size={20} />
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10 pb-24 pt-4 text-center text-[15px] text-white/60 md:pb-4">
        © 2024 AMARA Saffron Fine Dining. All rights reserved.
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Compass } from "lucide-react";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { BottomNav } from "@/components/layout/BottomNav";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Header */}
      <TopAppBar variant="solid" />

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="relative mx-auto flex max-w-lg flex-col items-center">
          {/* Decorative Compass Icon */}
          <div className="mb-6 grid size-20 place-items-center rounded-full bg-primary/10 text-primary">
            <Compass size={40} className="animate-spin-slow text-[#b86830]" />
          </div>

          {/* Large Serif Title */}
          <h1 className="font-serif text-8xl font-light tracking-widest text-[#b86830] md:text-9xl">
            404
          </h1>

          {/* Subtitle */}
          <h2 className="mt-4 font-serif text-2xl italic tracking-tight text-primary md:text-3xl">
            Halaman Tidak Ditemukan
          </h2>

          {/* Elegant Saffron Divider Line */}
          <span className="my-6 h-0.5 w-16 bg-gold" style={{ backgroundColor: "#f8d794" }} />

          {/* Body Description */}
          <p className="mb-8 max-w-[440px] text-sm leading-relaxed text-body">
            Hidangan atau halaman yang Anda cari tidak tersedia di dapur kami.
            Mungkin telah dipindahkan atau tautan yang Anda ikuti sudah kedaluwarsa.
            Mari kembali ke ruang makan utama.
          </p>

          {/* Action Links */}
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-primary/95 shadow-md hover:shadow-lg min-w-[180px]"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center justify-center rounded-lg border border-line bg-transparent px-6 py-3 text-sm font-semibold tracking-wide text-primary transition-colors hover:bg-primary/5 min-w-[180px]"
            >
              Lihat Menu Kami
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}

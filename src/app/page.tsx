import Link from "next/link";
import { Leaf, Flame, Sparkles } from "lucide-react";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { BottomNav } from "@/components/layout/BottomNav";
import { FeaturedMenu } from "@/features/menu/components/FeaturedMenu";

const EXPERIENCE = [
  {
    icon: Leaf,
    tint: "bg-secondary/20 text-secondary",
    title: "Ketenangan",
    body: "A serene atmosphere designed to elevate your dining experience away from the city's rush.",
  },
  {
    icon: Flame,
    tint: "bg-copper/10 text-copper",
    title: "Kehangatan",
    body: "Warm, inviting tones and genuine hospitality that make every visit feel like coming home.",
  },
  {
    icon: Sparkles,
    tint: "bg-gold/20 text-[#c08a1e]",
    title: "Pelayanan",
    body: "Impeccable attention to detail ensuring every moment of your meal is seamlessly orchestrated.",
  },
];

export default function LandingPage() {
  return (
    <>
      <TopAppBar variant="transparent" />

      {/* Hero */}
      <section className="relative flex min-h-[760px] items-center justify-center overflow-hidden pt-20 lg:h-[913px]">
        <div className="absolute inset-0 bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero.png"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[rgba(17,26,25,0.7)]" />
        </div>

        <div className="relative mx-auto flex max-w-[900px] flex-col items-center px-6 text-center">
          <h1 className="font-serif text-4xl italic leading-tight tracking-[-0.96px] text-white md:text-5xl">
            Where warmth is the finest luxury
          </h1>
          <span className="my-6 h-1 w-20 bg-[#f2b84b]" />
          <p className="mb-8 max-w-[662px] text-lg leading-[1.6] text-[#a5b5a1]">
            Discover a culinary journey inspired by the richness of saffron and
            the tranquility of the forest.
          </p>
          <Link
            href="/menu"
            className="rounded-lg bg-[#c86c45] px-6 py-4 text-sm font-semibold tracking-[0.28px] text-white shadow-[0px_10px_30px_-5px_rgba(40,65,57,0.3)] transition-colors hover:bg-copper"
          >
            Jelajahi Menu
          </Link>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-paper px-5 py-20 md:px-[120px]">
        <div className="mx-auto grid max-w-[1200px] items-center gap-16 md:grid-cols-2">
          <div className="flex flex-col gap-4 border-l-4 border-copper pl-7">
            <p className="font-serif text-xl italic leading-[1.4] text-body">
              &ldquo;We believe that every dish should tell a story of origin,
              crafted with the finest ingredients and an unwavering dedication
              to elegance.&rdquo;
            </p>
            <span className="label-eyebrow text-xs font-medium uppercase tracking-[1.2px] text-copper">
              Our Philosophy
            </span>
          </div>
          <div className="overflow-hidden rounded-xl shadow-[0px_10px_30px_-5px_rgba(40,65,57,0.08)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/chef.png"
              alt="Chef plating a dish"
              className="aspect-square w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Featured menu (connected to GET /menus) */}
      <FeaturedMenu />

      {/* Experience */}
      <section className="border-t border-line/20 bg-paper px-5 py-16 md:px-20">
        <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-3">
          {EXPERIENCE.map(({ icon: Icon, tint, title, body }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div
                className={`grid size-16 place-items-center rounded-full ${tint}`}
              >
                <Icon size={22} />
              </div>
              <h3 className="mt-4 font-serif text-xl text-ink">{title}</h3>
              <p className="mt-2 max-w-[280px] text-[16px] leading-[1.6] text-body">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <LandingFooter />
      <BottomNav />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { variants, overview } from "@/lib/content";

export const metadata: Metadata = {
  title: "ARISE PNU — Design Concepts & Portal",
  description:
    "부산대학교 AI 거점대학육성사업단(ARISE PNU) 사업 소개 페이지를 재해석한 디자인 시안 및 기존 포털 모음.",
};

export default function Hub() {
  return (
    <main className="min-h-[100dvh] bg-[#0b0b0c] text-[#ededed]">
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(255,255,255,0.06), transparent 70%)",
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 py-20 md:px-10 md:py-28">
        {/* Masthead */}
        <header className="mb-16 md:mb-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#8a8a85]">
            {overview.badge}
          </p>
          <h1 className="mt-6 font-display text-[clamp(2.5rem,7vw,6rem)] font-extrabold leading-[0.95] tracking-tight">
            ARISE PNU
            <span className="block text-[#8a8a85]">Concepts & Portal</span>
          </h1>
          <p className="mt-8 max-w-[60ch] text-base leading-relaxed text-[#b8b8b2] md:text-lg">
            {overview.org}의 사업 소개 페이지를 레퍼런스 디자인 언어로
            재해석한 시안들과 기존 마케팅 사이트(s30)의 모음입니다.
          </p>
        </header>

        {/* Variant gallery */}
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {variants.map((v, i) => {
            const isExternal = v.slug.startsWith("s30");
            const href = `/${v.slug}`;
            const cardContent = (
              <>
                {/* accent wash */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-50 blur-2xl transition-opacity duration-500 group-hover:opacity-80"
                  style={{ background: v.accent }}
                />
                <div className="relative flex items-start justify-between">
                  <span
                    className="font-mono text-[11px] uppercase tracking-[0.28em]"
                    style={{ color: readableMuted(v.bg) }}
                  >
                    {String(i + 1).padStart(2, "0")} / {v.vibe}
                  </span>
                  <span
                    aria-hidden
                    className="h-3 w-3 rounded-full ring-2 ring-white/20"
                    style={{ background: v.accent }}
                  />
                </div>

                <div className="relative">
                  <h2
                    className="text-3xl font-bold tracking-tight md:text-4xl"
                    style={{ color: readableInk(v.bg) }}
                  >
                    {v.name}
                  </h2>
                  <p
                    className="mt-3 text-sm md:text-base"
                    style={{ color: readableMuted(v.bg) }}
                  >
                    {v.desc}
                  </p>
                  <span
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-transform duration-300 group-hover:translate-x-1"
                    style={{ color: v.accent }}
                  >
                    {isExternal ? "기존 사이트 가기" : "시안 보기"}
                    <span aria-hidden>→</span>
                  </span>
                </div>
              </>
            );

            const className = "group relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 p-7 transition-colors duration-300 hover:border-white/25 md:min-h-[280px] md:p-9";

            return (
              <li key={v.slug}>
                {isExternal ? (
                  <a
                    href={href}
                    className={className}
                    style={{ background: v.bg }}
                  >
                    {cardContent}
                  </a>
                ) : (
                  <Link
                    href={href}
                    className={className}
                    style={{ background: v.bg }}
                  >
                    {cardContent}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <footer className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-[#6b6b66]">
          <span>arise@pusan.ac.kr · Next.js 16 · Tailwind v4 · GSAP · Lenis</span>
        </footer>
      </div>
    </main>
  );
}

/** Pick a readable ink/muted color depending on whether the swatch bg is light or dark. */
function isLight(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  // perceived luminance
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}
function readableInk(bg: string): string {
  return isLight(bg) ? "#16161a" : "#f4f4f0";
}
function readableMuted(bg: string): string {
  return isLight(bg) ? "#5c5c5c" : "#9a9a95";
}

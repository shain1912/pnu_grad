"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  overview,
  metrics,
  aura,
  achievements,
} from "@/lib/content";

/**
 * STICKY STACK (overlap / cover) scroll test — hut8.com style.
 * Each panel is `position: sticky; top: 0` so it locks to the viewport, and the
 * NEXT panel scrolls up and covers it. As the next panel arrives, the outgoing
 * panel scales down + dims, so it visibly recedes *behind* the incoming one.
 * This is independent of the snap-deck used by the 5 variants.
 */

type Panel = {
  key: string;
  bg: string;
  fg: string;
  accent: string;
  eyebrow: string;
  render: () => React.ReactNode;
};

const panels: Panel[] = [
  {
    key: "hero",
    bg: "#0e0e0f",
    fg: "#ededea",
    accent: "#c9a227",
    eyebrow: overview.badge,
    render: () => (
      <>
        <h1 className="font-display text-[clamp(3rem,11vw,10rem)] font-extrabold leading-[0.9] tracking-tight">
          같이
          <br />더 높게.
        </h1>
        <p className="mt-8 max-w-[44ch] text-lg text-white/55">
          {overview.org} · {overview.role}
        </p>
      </>
    ),
  },
  {
    key: "metric",
    bg: "#101826",
    fg: "#eef2f8",
    accent: "#4ea1ff",
    eyebrow: "Key Metrics",
    render: () => (
      <div className="grid w-full max-w-[1100px] grid-cols-2 gap-x-10 gap-y-12 md:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="font-display text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-none tracking-tight">
              {m.value.toLocaleString("ko-KR")}
              <span className="ml-1 text-[0.4em] font-semibold text-white/50">
                {m.unit}
              </span>
            </div>
            <div className="mt-3 text-sm text-white/55">{m.label}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "aura",
    bg: "#c75b3d",
    fg: "#fbf3ec",
    accent: "#1a1714",
    eyebrow: aura.subtitle,
    render: () => (
      <>
        <h2 className="font-display text-[clamp(2.5rem,9vw,8rem)] font-extrabold leading-none tracking-tight">
          {aura.title}
        </h2>
        <div className="mt-12 flex flex-wrap gap-x-16 gap-y-8">
          {aura.pillars.map((p) => (
            <div key={p.label}>
              <div className="font-display text-[clamp(3rem,7vw,6rem)] font-extrabold leading-none">
                {p.value}
              </div>
              <div className="mt-2 text-sm opacity-70">
                {p.label} · {p.labelEn}
              </div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    key: "ach",
    bg: "#f4f2ed",
    fg: "#16140f",
    accent: "#c75b3d",
    eyebrow: "Impact & Achievements",
    render: () => (
      <div className="w-full max-w-[1100px]">
        <h2 className="font-display text-[clamp(2.2rem,6vw,4.5rem)] font-extrabold leading-[0.95] tracking-tight">
          세계가 주목한 성과.
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
          {achievements.headline.map((h) => (
            <div
              key={h.value}
              className="border-t border-black/15 pt-5"
            >
              <div className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                {h.value}
              </div>
              <div className="mt-2 text-sm text-black/55">{h.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function Stack() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Smooth scroll (no snap-deck here — this is the stacking test).
    let lenis: Lenis | null = null;
    let tickerFn: ((t: number) => void) | null = null;
    if (!reduce) {
      lenis = new Lenis({ duration: 1.2 });
      lenis.on("scroll", ScrollTrigger.update);
      tickerFn = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      if (reduce) return;
      const cards = gsap.utils.toArray<HTMLElement>(".stack-card");
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return; // last one never recedes
        // As the NEXT card scrolls up to cover this one, dim + shrink it.
        gsap.to(card, {
          scale: 0.92,
          filter: "brightness(0.55)",
          ease: "none",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    }, root);

    return () => {
      ctx.revert();
      if (tickerFn) gsap.ticker.remove(tickerFn);
      lenis?.destroy();
    };
  }, []);

  return (
    <main ref={root} className="bg-black">
      {/* small fixed legend so the test is self-explanatory */}
      <div className="pointer-events-none fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/70 backdrop-blur">
        sticky stack · scroll ↓
      </div>

      {panels.map((p, i) => (
        <section
          key={p.key}
          className="stack-card sticky top-0 flex min-h-[100dvh] flex-col justify-center overflow-hidden px-6 md:px-16"
          style={{
            background: p.bg,
            color: p.fg,
            zIndex: i + 1, // later panels paint on top → they cover earlier ones
          }}
        >
          <span
            className="mb-6 font-mono text-[11px] uppercase tracking-[0.28em]"
            style={{ color: p.accent }}
          >
            {String(i + 1).padStart(2, "0")} — {p.eyebrow}
          </span>
          {p.render()}
        </section>
      ))}

      {/* tail so the final panel can settle fully into view */}
      <div className="h-[20vh] bg-[#f4f2ed]" />
    </main>
  );
}

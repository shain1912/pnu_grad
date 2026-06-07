"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { aura } from "@/lib/content";

export default function Aura() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context((self) => {
      const scope = self.selector!;

      // Vision diagram tiers cascade down the hierarchy.
      gsap.from(scope(".aura-tier"), {
        opacity: 0,
        y: 30,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: scope(".aura-diagram")[0], start: "top 78%" },
      });

      // Connector lines draw down.
      gsap.from(scope(".aura-connector"), {
        scaleY: 0,
        transformOrigin: "top",
        stagger: 0.12,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: { trigger: scope(".aura-diagram")[0], start: "top 78%" },
      });

      // 4 axis nodes.
      gsap.from(scope(".aura-axis"), {
        opacity: 0,
        y: 24,
        scale: 0.92,
        stagger: 0.08,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: scope(".aura-axes")[0], start: "top 82%" },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id="aura" ref={root} className="relative bg-[var(--bg)]">
      <div className="aura-stage px-6 pb-16 pt-32 sm:px-8">
        <div
          className="mono-bloom"
          style={{ top: "44%", opacity: 0.85 }}
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col items-center">
          {/* Header */}
          <div className="aura-tier flex flex-col items-center text-center">
            <span className="mono-label mb-4">{aura.subtitle}</span>
            <div className="aura-title" tabIndex={0}>
              <span
                className="aura-title__main"
                style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)" }}
              >
                {aura.title}
              </span>
              <span className="aura-title__sub">
                {aura.period} · {aura.investment}
              </span>
            </div>
          </div>

          {/* ── 4-tier vision diagram ── */}
          <div className="aura-diagram mt-10 flex w-full flex-col items-center">
            {/* TIER 1 — Vision */}
            <div className="aura-tier aura-vision">
              <span className="mono-label !text-[var(--gold)]">VISION · 비전</span>
              <h3 className="mt-2 font-heavy text-2xl uppercase tracking-tight text-[var(--text)] md:text-3xl">
                {aura.vision}
              </h3>
            </div>

            <span className="aura-connector" aria-hidden />

            {/* TIER 2 — Goal + 4 goal targets */}
            <div className="aura-tier aura-goal">
              <span className="mono-label">GOAL · 목표</span>
              <p className="mt-1.5 text-base font-medium text-[var(--text)] md:text-lg">
                {aura.goal}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {aura.goalTargets.map((g) => (
                  <div
                    key={g.label}
                    className="flex flex-col gap-1 rounded-lg border border-[var(--hairline)] bg-[rgba(201,162,39,0.05)] p-2.5"
                  >
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--gold)]">
                      {g.tag}
                    </span>
                    <span className="text-[0.78rem] leading-snug text-[var(--metal)]">
                      {g.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <span className="aura-connector" aria-hidden />

            {/* TIER 3 — 4 A.U.R.A axes */}
            <div className="aura-axes grid w-full grid-cols-2 gap-2.5 md:grid-cols-4">
              {aura.framework.map((f, i) => (
                <div
                  key={`${f.letter}-${i}`}
                  className="aura-axis flex flex-col items-center rounded-xl border border-[rgba(201,162,39,0.32)] bg-[var(--surface)] p-3.5 text-center"
                >
                  <span className="font-heavy text-3xl leading-none text-[var(--gold)] md:text-4xl">
                    {f.letter}
                  </span>
                  <span className="mono-label mt-2 !text-[0.6rem]">{f.en}</span>
                  <span className="mt-1 text-sm font-medium text-[var(--text)]">
                    {f.ko}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { aura } from "@/lib/content";
import { useReveal } from "@/lib/scroll";

/**
 * P1 home — compact 비전체계도 요약 (full diagram lives on /aura).
 * Light entrance via useReveal; tiers + 8/22/47 summary + link out to P4.
 */
export default function VisionSummary() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section
      ref={root}
      className="mono-section mono-goldwash"
      aria-label="비전체계도 요약"
    >
      <div
        className="mono-bloom"
        style={{ top: "40%", opacity: 0.6 }}
        aria-hidden
      />
      <div className="mono-section__inner flex flex-col items-center text-center">
        <span className="mono-label mb-3" data-reveal>
          비전체계도 / VISION FRAMEWORK
        </span>

        {/* TIER 1 — Vision */}
        <div className="aura-tier aura-vision" data-reveal>
          <span className="mono-label !text-[var(--gold)]">VISION · 비전</span>
          <h2 className="mt-2 font-heavy text-2xl uppercase leading-tight tracking-tight text-[var(--text)] md:text-3xl">
            {aura.vision}
          </h2>
        </div>

        <span className="aura-connector" aria-hidden />

        {/* TIER 2 — Goal + 4 goal targets */}
        <div className="aura-tier aura-goal" data-reveal>
          <span className="mono-label">GOAL · 목표</span>
          <p className="mt-1.5 text-balance text-base font-medium text-[var(--text)] md:text-lg">
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

        {/* TIER 3 — 8 / 22 / 47 summary */}
        <div
          className="aura-tier flex w-full max-w-[720px] items-end justify-center gap-8 sm:gap-16"
          data-reveal
        >
          {aura.pillars.map((p) => (
            <div key={p.label} className="flex flex-col items-center text-center">
              <span
                className="aura-figure-num"
                style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)" }}
              >
                {p.value}
              </span>
              <span className="mt-1 text-sm font-medium text-[var(--text)]">
                {p.label}
              </span>
              <span className="mono-label !text-[0.58rem]">{p.labelEn}</span>
            </div>
          ))}
        </div>

        <Link
          href="/bymonolog/aura"
          className="mono-pill mono-pill--solid mt-10"
          data-reveal
        >
          <span className="tw-nowrap">A.U.R.A. 전체 보기</span>
          <ArrowUpRight size={14} weight="bold" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

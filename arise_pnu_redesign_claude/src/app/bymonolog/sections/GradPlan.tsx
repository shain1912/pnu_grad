"use client";

import { useRef } from "react";
import { Flag, Path, ArrowsLeftRight } from "@phosphor-icons/react";
import { gradPlan } from "@/lib/content";
import { useReveal } from "@/lib/scroll";
import { useCountUp, useGhostParallax } from "./gradMotion";

/* PNU 1000 AX ecosystem flow — 4 nodes from the program description
   ("연구소–대학원–산업–학생 URP·패스트트랙 생태계"). Copy is fixed, no new numbers. */
const FLOW = [
  { k: "01", name: "연구소", body: "원천 연구 · 과제 발굴" },
  { k: "02", name: "대학원", body: "URP · 패스트트랙 양성" },
  { k: "03", name: "산업", body: "AX-PBL 문제해결 경험" },
  { k: "04", name: "학생", body: "1,000명 진학 · 장학 지원" },
] as const;

/** Parse "+1,000명" → { sign:"+", target:1000, suffix:"명" } for count-up. */
function parseTarget(value: string): {
  sign: string;
  target: number;
  suffix: string;
} | null {
  const m = value.match(/^([+−-]?)([\d,]+)(.*)$/);
  if (!m) return null;
  return {
    sign: m[1] === "−" || m[1] === "-" ? "−" : m[1] === "+" ? "+" : "",
    target: Number(m[2].replace(/,/g, "")),
    suffix: m[3] ?? "",
  };
}

/**
 * P2 발전계획. VISUAL LAYER:
 *   Slide 8  목표 · 현황   — count-up targets (+1,000 / +2,000) + ghost glyph parallax
 *   Slide 9  A. Top-Down  — PNU 1000 AX ECOSYSTEM FLOW diagram + 기관 정책 3
 *   Slide 10 B. Bottom-Up — 3-STEP STEPPER diagram (not a list)
 * Light useReveal entrance; count-up is the only number motion here (the two
 * special GSAP beats live in GradReality sticky-stack + GradCompare line-draw).
 */
export default function GradPlan() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  useCountUp(root);
  useGhostParallax(root);

  return (
    <div ref={root}>
      {/* ── Slide 8 — 발전계획 목표 + 현황 (count-up + ghost glyph) ─ */}
      <section className="mono-slide">
        <span
          className="grad-ghost grad-ghost--left"
          data-ghost
          data-ghost-shift="120"
          aria-hidden
        >
          育
        </span>
        <div className="mono-slide__inner">
          <div className="flex items-center gap-3" data-reveal>
            <span className="grad-icon shrink-0" aria-hidden>
              <Flag size={20} weight="duotone" />
            </span>
            <span className="mono-label !text-[var(--gold)]">{gradPlan.title}</span>
          </div>
          <h2
            className="mt-4 max-w-2xl text-balance font-heavy text-3xl leading-[1.05] tracking-tight text-[var(--text)] md:text-5xl"
            data-reveal
          >
            목표 · 현황
          </h2>
          <p
            className="mt-5 max-w-2xl text-balance text-base leading-relaxed text-[var(--muted)]"
            data-reveal
          >
            {gradPlan.intro}
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
            <div className="flex flex-col gap-3">
              {gradPlan.targets.map((t) => {
                const p = parseTarget(t.value);
                return (
                  <div
                    key={t.label}
                    className="flex items-baseline gap-4 rounded-xl border border-[rgba(201,162,39,0.4)] bg-[var(--surface)] p-5"
                    data-reveal
                  >
                    <span className="font-display text-3xl font-extrabold tracking-tight text-[var(--gold)] tabular-nums md:text-4xl">
                      {p ? (
                        <span
                          className="grad-count"
                          data-count={p.target}
                          data-prefix={p.sign}
                          data-suffix={p.suffix}
                        >
                          {p.sign}0{p.suffix}
                        </span>
                      ) : (
                        t.value
                      )}
                    </span>
                    <span className="text-balance text-sm text-[var(--metal)]">
                      {t.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <article
              className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-6"
              data-reveal
            >
              <h3 className="text-balance text-base font-medium leading-tight text-[var(--text)]">
                {gradPlan.status.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {gradPlan.status.points.map((p) => (
                  <li key={p} className="flex gap-2.5">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--gold)]" />
                    <span className="text-balance text-[0.84rem] leading-relaxed text-[var(--metal)]">
                      {p}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 font-mono text-[0.62rem] tracking-[0.14em] text-[var(--muted)]">
                출처: {gradPlan.status.source}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ── Slide 9 — A. Top-Down + PNU 1000 AX ecosystem flow ──── */}
      <section className="mono-slide" aria-label="Top-Down 기관 정책">
        <div className="mono-slide__inner">
          <div className="flex items-baseline gap-3" data-reveal>
            <span className="font-heavy text-3xl leading-none text-[var(--gold)]">
              A
            </span>
            <h2 className="text-balance font-heavy text-2xl leading-[1.05] tracking-tight text-[var(--text)] md:text-4xl">
              {gradPlan.topdown.title}
            </h2>
          </div>

          {/* PNU 1000 AX 생태계 흐름 — 연구소 → 대학원 → 산업 → 학생 */}
          <div className="mt-8" data-reveal>
            <div className="mb-3 flex items-center gap-2">
              <Path size={16} weight="duotone" className="text-[var(--gold)]" />
              <span className="mono-label !text-[var(--gold)]">
                PNU 1000 AX 생태계 흐름
              </span>
            </div>
            <div className="grad-flow">
              {FLOW.map((n, i) => (
                <div
                  key={n.k}
                  className={`grad-flow__node ${
                    i === FLOW.length - 1 ? "grad-flow__node--core" : ""
                  }`}
                >
                  <span className="grad-flow__k">{n.k}</span>
                  <b>{n.name}</b>
                  <span>{n.body}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {gradPlan.topdown.items.map((it) => (
              <article
                key={it.name}
                className="flex flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-6"
                data-reveal
              >
                <h3 className="text-balance text-base font-medium leading-tight text-[var(--text)]">
                  {it.name}
                </h3>
                <p className="mt-3 text-balance text-[0.84rem] leading-relaxed text-[var(--metal)]">
                  {it.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Slide 10 — B. Bottom-Up 3-step stepper diagram ──────── */}
      <section className="mono-slide mono-goldwash" aria-label="Bottom-Up 학과 주도">
        <div className="mono-slide__inner">
          <div className="flex items-baseline gap-3" data-reveal>
            <span className="font-heavy text-3xl leading-none text-[var(--gold)]">
              B
            </span>
            <h2 className="text-balance font-heavy text-2xl leading-[1.05] tracking-tight text-[var(--text)] md:text-4xl">
              {gradPlan.bottomup.title}
            </h2>
          </div>
          <div className="mb-1 mt-5 flex items-center gap-2" data-reveal>
            <ArrowsLeftRight
              size={16}
              weight="duotone"
              className="text-[var(--gold)]"
            />
            <span className="mono-label !text-[var(--gold)]">
              진단 → 분석 → 발전계획 제출
            </span>
          </div>
          <ol className="grad-stepper mt-5">
            {gradPlan.bottomup.steps.map((s) => (
              <li key={s.k} className="grad-stepper__step" data-reveal>
                <span className="grad-stepper__num">{s.k}</span>
                <span className="text-balance text-base font-medium leading-tight text-[var(--text)]">
                  {s.name}
                </span>
                <span className="text-balance text-[0.84rem] leading-relaxed text-[var(--metal)]">
                  {s.body}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

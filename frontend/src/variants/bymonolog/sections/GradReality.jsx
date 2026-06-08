"use client";

import { useRef } from "react";
import { ChartLineDown, GraduationCap, Cpu, MapPinLine } from "@phosphor-icons/react";
import { gradReality } from "@/lib/content";
import { useReveal } from "@/lib/scroll";
import { useCountUp, useStickyStack, useGhostParallax } from "./gradMotion";

const OECD_MAX = Math.max(...gradReality.oecd.map((o) => o.value));

function parseStat(value) {
  const m = value.match(/^([−-]?)(\d+(?:\.(\d+))?)(%?)(.*)$/);
  if (!m) return null;
  return {
    sign: m[1] === "−" || m[1] === "-" ? "−" : "",
    target: Number(m[2]),
    decimals: m[3] ? m[3].length : 0,
    suffix: m[4] ?? "",
    rest: m[5] ?? "",
  };
}

const TOPIC_ICONS = [GraduationCap, Cpu, MapPinLine];

/**
 * P2 — 현실(WHY). VISUAL LAYER:
 *   Slide 1  현실 인트로  — count-up headline stats + faint blueprint grid + icon
 *   Slides 2-4  진단 1.1/1.2/1.3 — SCOPED STICKY-STACK (special GSAP beat #1):
 *               each topic sticks and the next covers it (dim+shrink), with a
 *               giant ghosted numeral drifting behind via parallax.
 *   Slide 5  지역 격차 + OECD — animated 3-bar chart (한국 gold), count-up driven.
 * Light useReveal elsewhere; motion gated behind prefers-reduced-motion.
 */
export default function GradReality() {
  const root = useRef(null);
  const stackRef = useRef(null);
  useReveal(root);
  useCountUp(root);
  useStickyStack(stackRef);
  useGhostParallax(stackRef);

  return (
    <div ref={root}>
      {/* ── Slide 1 — 현실 인트로 (count-up + blueprint grid) ───── */}
      <section id="grad-reality" className="mono-slide">
        <div className="grad-blueprint" aria-hidden />
        <div className="mono-slide__inner">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <span className="mono-label" data-reveal>
              Ⅰ 대학원 육성 / WHY
            </span>
            <span className="mono-label" data-reveal>
              {gradReality.source}
            </span>
          </div>

          <div className="mt-8 flex items-start gap-4" data-reveal>
            <span className="grad-icon mt-1.5 shrink-0" aria-hidden>
              <ChartLineDown size={22} weight="duotone" />
            </span>
            <h1 className="max-w-3xl text-balance font-heavy text-4xl uppercase leading-[0.98] tracking-tight text-[var(--text)] md:text-6xl">
              {gradReality.title}
            </h1>
          </div>
          <p
            className="mt-5 max-w-xl text-balance text-lg leading-relaxed text-[var(--muted)]"
            data-reveal
          >
            {gradReality.lead}
          </p>

          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-2 lg:grid-cols-4">
            {gradReality.stats.map((s, i) => {
              const p = parseStat(s.value);
              return (
                <div
                  key={s.label}
                  className="flex flex-col bg-[var(--bg)] p-6"
                  data-reveal
                >
                  <span className="font-mono text-[0.62rem] tracking-[0.16em] text-[var(--gold)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-3 font-display text-3xl font-extrabold leading-none tracking-tight text-[var(--gold)] tabular-nums md:text-4xl">
                    {p ? (
                      <>
                        <span
                          className="grad-count"
                          data-count={p.target}
                          data-decimals={p.decimals}
                          data-prefix={p.sign}
                          data-suffix={p.suffix}
                        >
                          {p.sign}0{p.suffix}
                        </span>
                        {p.rest}
                      </>
                    ) : (
                      s.value
                    )}
                  </span>
                  <span className="mt-3 text-balance text-sm font-medium text-[var(--text)]">
                    {s.label}
                  </span>
                  <span className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                    {s.note}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Slides 2-4 — 진단 1.1 / 1.2 / 1.3 SCOPED STICKY-STACK ──
          Three topics stick + cover each other (special GSAP beat #1). The
          final card (1.3 지역 격차) is the goldwash accent pop and carries the
          OECD 3-bar chart, keeping the deck at 9 one-idea slides. */}
      <div ref={stackRef} className="grad-stack">
        {gradReality.topics.map((t, i) => {
          const Icon = TOPIC_ICONS[i] ?? GraduationCap;
          const last = i === gradReality.topics.length - 1;
          return (
            <section
              key={t.no}
              className={`grad-stack__card mono-slide ${
                last ? "mono-goldwash" : ""
              }`}
              style={last ? undefined : { background: i % 2 === 0 ? "#0c0f17" : "#15151b" }}
              aria-label={`진단 ${t.no} ${t.title}`}
            >
              {!last ? (
                <span
                  className="grad-ghost grad-ghost--right"
                  data-ghost
                  data-ghost-shift="160"
                  aria-hidden
                >
                  {t.no}
                </span>
              ) : null}
              <div
                className={`mono-slide__inner ${
                  last
                    ? "grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
                    : "max-w-2xl"
                }`}
              >
                <div>
                  <div className="flex items-center gap-3" data-reveal>
                    <span className="grad-icon shrink-0" aria-hidden>
                      <Icon size={20} weight="duotone" />
                    </span>
                    <span className="mono-label !text-[var(--gold)]">
                      진단 {t.no}
                    </span>
                  </div>
                  <h2
                    className="mt-4 text-balance font-heavy text-3xl leading-[1.05] tracking-tight text-[var(--text)] md:text-5xl"
                    data-reveal
                  >
                    {t.title}
                  </h2>
                  <ul className="mono-bullets mt-9">
                    {t.points.map((p) => (
                      <li key={p} className="mono-bullet" data-reveal>
                        <span className="dot" />
                        <span className="text-balance">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* OECD 석사 비율 — 3-bar chart, 한국 gold, count-up (on 1.3 only) */}
                {last ? (
                  <article
                    className="flex flex-col rounded-2xl border border-[rgba(201,162,39,0.4)] bg-[rgba(201,162,39,0.05)] p-7"
                    data-reveal
                  >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-balance text-base font-medium leading-tight text-[var(--text)]">
                  석사학위 비율 <span className="tw-nowrap">국제 비교</span>
                </h3>
                <span className="font-mono text-[0.62rem] tracking-[0.14em] text-[var(--muted)]">
                  %
                </span>
              </div>
              <ul className="mt-7 flex flex-col gap-5">
                {gradReality.oecd.map((o) => {
                  const self = "self" in o && o.self;
                  return (
                    <li key={o.label} className="flex flex-col gap-1.5">
                      <div className="flex items-baseline justify-between">
                        <span
                          className={`text-sm tw-nowrap ${
                            self
                              ? "font-medium text-[var(--gold)]"
                              : "text-[var(--metal)]"
                          }`}
                        >
                          {o.label}
                        </span>
                        <span
                          className={`grad-count font-display text-lg font-extrabold tabular-nums ${
                            self ? "text-[var(--gold)]" : "text-[var(--text)]"
                          }`}
                          data-count={o.value}
                          data-decimals={1}
                        >
                          0.0
                        </span>
                      </div>
                      <div className="grad-bar h-2 w-full overflow-hidden rounded-full bg-[rgba(185,182,172,0.14)]">
                        <span
                          className={`block h-full origin-left rounded-full ${
                            self
                              ? "bg-[var(--gold)]"
                              : "bg-[rgba(185,182,172,0.45)]"
                          }`}
                          style={{ width: `${(o.value / OECD_MAX) * 100}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
                    </ul>
                    <p className="mt-6 text-balance text-xs leading-relaxed text-[var(--muted)]">
                      한국 석사 비율은 OECD·EU 평균의 1/5 수준.
                    </p>
                  </article>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { ChartBar, ChartLineDown } from "@phosphor-icons/react";
import { gradCompare } from "@/lib/content";
import { useReveal } from "@/lib/scroll";
import { useCountUp, useLineDraw } from "./gradMotion";

const BAR_MAX = Math.max(...gradCompare.bars.map((b) => b.value));

/* ── 10년 추이 line-chart series (numbers from gradCompare.national.points) ──
   부산대 6,191 → 5,525 (−10.7%, 내림세) · KAIST 6,701 → 8,388 (+25.2%, 오름세). */
const SERIES = [
  { name: "부산대", from: 6191, to: 5525, self: true },
  { name: "KAIST", from: 6701, to: 8388, self: false },
] as const;

const CHART = { w: 520, h: 300, padX: 56, padY: 36 } as const;
const ALL = SERIES.flatMap((s) => [s.from, s.to]);
const Y_MIN = Math.min(...ALL) * 0.96;
const Y_MAX = Math.max(...ALL) * 1.04;
const xAt = (i: number) =>
  CHART.padX + i * (CHART.w - CHART.padX * 2);
const yAt = (v: number) =>
  CHART.padY +
  (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * (CHART.h - CHART.padY * 2);

/**
 * P2 비교 (타대 비교). VISUAL LAYER:
 *   Slide 6  거점국립대 1위  — 대학원생 규모 bars (부산대 gold) + count-up + icon
 *   Slide 7  전국 10년 추이  — SVG LINE CHART, drawn via strokeDashoffset SCRUB
 *            (special GSAP beat #2 / signature data moment): 부산대 내림세(gold)
 *            vs KAIST 오름세.
 * Light useReveal entrance; motion gated behind prefers-reduced-motion.
 */
export default function GradCompare() {
  const root = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  useReveal(root);
  useCountUp(root);
  useLineDraw(chartRef);

  return (
    <div ref={root}>
      {/* ── Slide 6 — 거점국립대 1위 + bars ─────────────────────── */}
      <section className="mono-slide" aria-label="거점국립대 1위">
        <div className="mono-slide__inner">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <span className="mono-label">비교 / COMPARISON · 타대 비교</span>
            <span className="font-mono text-[0.62rem] tracking-[0.16em] text-[var(--muted)]">
              출처: {gradCompare.source}
            </span>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <div className="flex items-center gap-3" data-reveal>
                <span className="grad-icon shrink-0" aria-hidden>
                  <ChartBar size={20} weight="duotone" />
                </span>
                <span className="mono-label !text-[var(--gold)]">REGIONAL</span>
              </div>
              <h2
                className="mt-4 text-balance font-heavy text-3xl leading-[1.05] tracking-tight text-[var(--text)] md:text-5xl"
                data-reveal
              >
                {gradCompare.regional.title}
              </h2>
              <ul className="mono-bullets mt-8">
                {gradCompare.regional.points.map((p) => (
                  <li key={p} className="mono-bullet" data-reveal>
                    <span className="dot" />
                    <span className="text-balance">{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 대학원생 규모 · 10년 증감 — 부산대 gold, count-up */}
            <article
              className="flex flex-col rounded-2xl border border-[rgba(201,162,39,0.4)] bg-[rgba(201,162,39,0.05)] p-7"
              data-reveal
            >
              <span className="mono-label !text-[var(--gold)]">
                대학원생 규모 · 10년 증감
              </span>
              <ul className="mt-6 flex flex-col gap-5">
                {gradCompare.bars.map((b) => {
                  const self = "self" in b && b.self;
                  return (
                    <li key={b.name} className="flex flex-col gap-1.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className={`text-sm tw-nowrap ${
                            self
                              ? "font-medium text-[var(--gold)]"
                              : "text-[var(--metal)]"
                          }`}
                        >
                          {b.name}
                        </span>
                        <span className="flex items-baseline gap-2">
                          <span
                            className={`grad-count font-display text-base font-extrabold tabular-nums ${
                              self ? "text-[var(--gold)]" : "text-[var(--text)]"
                            }`}
                            data-count={b.value}
                          >
                            0
                          </span>
                          {b.delta ? (
                            <span className="font-mono text-[0.62rem] tabular-nums text-[var(--muted)]">
                              {b.delta}
                            </span>
                          ) : null}
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[rgba(185,182,172,0.14)]">
                        <span
                          className={`block h-full rounded-full ${
                            self
                              ? "bg-[var(--gold)]"
                              : "bg-[rgba(185,182,172,0.45)]"
                          }`}
                          style={{ width: `${(b.value / BAR_MAX) * 100}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-6 text-balance text-xs leading-relaxed text-[var(--muted)]">
                명 · 부산대 골드 하이라이트
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ── Slide 7 — 전국 10년 추이 SVG LINE CHART (scrub-draw) ── */}
      <section className="mono-slide mono-goldwash" aria-label="전국 10년 추이">
        <div className="mono-slide__inner">
          <div className="flex items-center gap-3" data-reveal>
            <span className="grad-icon shrink-0" aria-hidden>
              <ChartLineDown size={20} weight="duotone" />
            </span>
            <span className="mono-label">NATIONAL · 10년 추이</span>
          </div>
          <div className="mt-6 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <h2
                className="text-balance font-heavy text-3xl leading-[1.05] tracking-tight text-[var(--text)] md:text-5xl"
                data-reveal
              >
                {gradCompare.national.title}
              </h2>
              <p
                className="mt-5 max-w-xl text-balance text-base leading-relaxed text-[var(--muted)]"
                data-reveal
              >
                {gradCompare.lead}
              </p>
              <ul className="mono-bullets mt-7">
                {gradCompare.national.points.map((p) => (
                  <li key={p} className="mono-bullet" data-reveal>
                    <span className="dot" />
                    <span className="text-balance">{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* line chart — 부산대 내림세(gold) vs KAIST 오름세 */}
            <div ref={chartRef} className="grad-linechart" data-reveal>
              <svg
                viewBox={`0 0 ${CHART.w} ${CHART.h}`}
                role="img"
                aria-label="부산대 내림세, KAIST 오름세 10년 추이 라인 차트"
              >
                {/* horizontal grid lines */}
                {[0, 0.5, 1].map((t) => {
                  const y = CHART.padY + t * (CHART.h - CHART.padY * 2);
                  return (
                    <line
                      key={t}
                      className="grad-line__grid"
                      x1={CHART.padX}
                      x2={CHART.w - CHART.padX}
                      y1={y}
                      y2={y}
                    />
                  );
                })}
                {/* x-axis era labels */}
                <text
                  className="grad-line__label"
                  x={CHART.padX}
                  y={CHART.h - 10}
                  fill="rgba(185,182,172,0.7)"
                  textAnchor="start"
                  data-line-mark
                >
                  10년 전
                </text>
                <text
                  className="grad-line__label"
                  x={CHART.w - CHART.padX}
                  y={CHART.h - 10}
                  fill="rgba(185,182,172,0.7)"
                  textAnchor="end"
                  data-line-mark
                >
                  현재
                </text>

                {SERIES.map((s) => {
                  const x0 = xAt(0);
                  const x1 = xAt(1);
                  const y0 = yAt(s.from);
                  const y1 = yAt(s.to);
                  const d = `M ${x0} ${y0} L ${x1} ${y1}`;
                  return (
                    <g key={s.name}>
                      <path
                        className={`grad-line grad-line--animated ${
                          s.self ? "grad-line--down" : "grad-line--up"
                        }`}
                        d={d}
                        data-line
                      />
                      <circle
                        className={
                          s.self ? "grad-line__dot--self" : "grad-line__dot--other"
                        }
                        cx={x0}
                        cy={y0}
                        r={4}
                        data-line-mark
                      />
                      <circle
                        className={
                          s.self ? "grad-line__dot--self" : "grad-line__dot--other"
                        }
                        cx={x1}
                        cy={y1}
                        r={5}
                        data-line-mark
                      />
                      <text
                        className="grad-line__label"
                        x={x1 - 6}
                        y={y1 + (s.self ? 20 : -10)}
                        fill={s.self ? "var(--gold)" : "rgba(185,182,172,0.85)"}
                        textAnchor="end"
                        fontWeight={s.self ? 700 : 500}
                        data-line-mark
                      >
                        {s.name} {s.to.toLocaleString()}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

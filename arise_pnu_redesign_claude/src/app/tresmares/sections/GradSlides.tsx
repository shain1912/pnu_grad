"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import {
  Cpu,
  MapPinLine,
  Flask,
  GraduationCap,
  Buildings,
  Student,
  ArrowRight,
} from "@phosphor-icons/react";
import { useReveal } from "@/lib/scroll";
import {
  gradReality,
  gradCompare,
  gradPlan,
  brandAssets,
} from "@/lib/content";
import {
  useStickyStack,
  useLineDraw,
  useCountUp,
  useGhostParallax,
  useBarGrow,
} from "./gradMotion";

/**
 * P2 대학원 육성 [WHY] — 9 LIGHT one-idea slides with a VISUAL + GSAP layer.
 *
 * VISUAL COMBO = 데이터 시각화 + 다이어그램 + 분위기(atmosphere):
 *   · data-viz : count-up numbers, OECD/거점대 animated bar charts, an SVG LINE
 *                CHART (부산대 내림세 vs KAIST 오름세) drawn on scroll.
 *   · diagram  : PNU 1000 AX 생태계 flow (연구소→대학원→산업→학생) + Bottom-Up
 *                3-step connected stepper.
 *   · atmosphere: per-slide ink/bone tint, faint blueprint grid, giant ghosted
 *                numeral/glyph parallax behind ~2 slides, subtle grain, Phosphor
 *                icon per 진단 topic, a single faint PNU symbol watermark.
 *
 * GSAP 적재적소·가끔 — NOT every transition. Most slides keep the light
 * `useReveal` entrance. Only 3 SPECIAL beats:
 *   (a) line-chart strokeDashoffset SCRUB DRAW  → SlideNational (signature)
 *   (b) ONE scoped STICKY-STACK of the 3 진단 토픽 → SlideDiagnosisStack
 *   (c) count-up + ghost-numeral PARALLAX        → SlideIntro
 * Everything gates behind prefers-reduced-motion via gsap.context + ctx.revert().
 */

const OECD_MAX = Math.max(...gradReality.oecd.map((o) => o.value));
const BAR_MAX = Math.max(...gradCompare.bars.map((b) => b.value));

/** Split a stat value ("70.6%", "−22.4%", "4.37 : 7.79", "+1,000명") into a
 *  count-up-able leading number + the literal remainder, so count-up only
 *  animates the first numeric token and the copy stays exactly as authored. */
function parseStat(raw: string): {
  prefix: string;
  count: number | null;
  decimals: number;
  suffix: string;
} {
  const m = raw.match(/^([+\-−]?)(\d[\d,]*)(\.\d+)?(.*)$/);
  if (!m) return { prefix: "", count: null, decimals: 0, suffix: raw };
  const sign = m[1] === "−" || m[1] === "-" ? "−" : m[1] === "+" ? "+" : "";
  const intPart = m[2].replace(/,/g, "");
  const dec = m[3] ?? "";
  const count = Number(intPart + dec);
  return {
    prefix: sign,
    count,
    decimals: dec ? dec.length - 1 : 0,
    suffix: m[4] ?? "",
  };
}

/** A count-up number that degrades to plain text for non-leading-number values. */
function StatValue({ raw }: { raw: string }) {
  const p = parseStat(raw);
  if (p.count === null) return <>{raw}</>;
  return (
    <span
      data-count={p.count}
      data-decimals={p.decimals}
      data-prefix={p.prefix}
      data-suffix={p.suffix}
    >
      {p.prefix}
      {p.count.toLocaleString("en-US")}
      {p.suffix}
    </span>
  );
}

/** One light slide: a self-contained reveal scope, ~one viewport tall. */
function Slide({
  label,
  variant,
  grid,
  children,
}: {
  label: string;
  variant?: "bone" | "ink";
  grid?: boolean;
  children: ReactNode;
}) {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);
  return (
    <section
      ref={scope}
      className={
        "tm-gs" +
        (variant ? ` tm-gs--${variant}` : "") +
        (grid ? " tm-gs--grid" : "")
      }
      aria-label={label}
    >
      <div className="tm-shell tm-gs__shell">{children}</div>
    </section>
  );
}

/* ── Slide 1 · 현실 인트로 — lead + count-up stats + ghost glyph parallax ─── */
/* SPECIAL (c): count-up on the 4 stats + a giant ghosted “역설” glyph drifting
   behind the slide on scroll (parallax). */
function SlideIntro() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);
  useCountUp(scope);
  useGhostParallax(scope);
  return (
    <section
      ref={scope}
      className="tm-gs tm-gs--ink tm-gs--grid"
      aria-label="현실 인트로"
    >
      <span className="tm-gs__ghost" aria-hidden data-ghost data-ghost-shift="160">
        역설
      </span>
      <div className="tm-shell tm-gs__shell">
        <div className="tm-gs__head" data-reveal>
          <p className="tm-label tm-label--accent">Ⅰ · WHY — 대학원 육성</p>
          <h2 className="tm-gs__title tm-gs__title--lg tw-balance">
            {gradReality.title}
          </h2>
          <p className="tm-gs__lead">{gradReality.lead}</p>
        </div>
        <div className="tm-gs__stats">
          {gradReality.stats.map((s, i) => (
            <article key={s.label} className="tm-gs__stat" data-reveal>
              <span className="tm-gs__statidx" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="tm-gs__statval tabular-nums">
                <StatValue raw={s.value} />
              </span>
              <span className="tm-gs__statlabel tw-balance">{s.label}</span>
              <span className="tm-gs__statnote">{s.note}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const DIAG_ICONS = [GraduationCap, Cpu, MapPinLine] as const;

/* ── Slides 2–4 · 진단 1.1 / 1.2 / 1.3 — SCOPED STICKY-STACK ───────────────── */
/* SPECIAL (b): the three 진단 토픽 stack like /stacktest — each card is sticky and
   the next slides up to cover the previous (which dims + recedes). 1.3 carries
   the OECD animated bar chart. Scoped to this wrapper only; reduced-motion safe. */
function SlideDiagnosisStack() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  useStickyStack(root);
  useBarGrow(root);
  return (
    <section className="tm-stack" aria-label="진단 1.1·1.2·1.3" ref={root}>
      {gradReality.topics.map((t, i) => {
        const Icon = DIAG_ICONS[i] ?? GraduationCap;
        const last = i === gradReality.topics.length - 1;
        return (
          <article
            key={t.no}
            className={
              "tm-stack__card tm-gs--grid" + (last ? " tm-stack__card--bone" : "")
            }
            style={{ zIndex: i + 1 }}
          >
            <span className="tm-gs__ghost tm-gs__ghost--no" aria-hidden>
              {t.no}
            </span>
            <div className="tm-shell tm-stack__inner">
              <div className="tm-stack__head">
                <span className="tm-stack__icon" aria-hidden>
                  <Icon weight="thin" />
                </span>
                <p className="tm-label tm-label--accent">진단 {t.no}</p>
              </div>
              <h2 className="tm-gs__title tw-balance">{t.title}</h2>
              {last ? (
                <div className="tm-gs__split tm-stack__split">
                  <ul className="tm-gs__points">
                    {t.points.map((p) => (
                      <li key={p} className="tm-gs__point">
                        <span className="tm-nav__mark" aria-hidden />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <aside className="tm-gs__chart">
                    <p className="tm-label">석사학위 비율 · OECD 비교</p>
                    <ul className="tm-gs__bars">
                      {gradReality.oecd.map((o) => (
                        <li
                          key={o.label}
                          className={
                            "tm-gs__bar" +
                            ("self" in o && o.self ? " tm-gs__bar--self" : "")
                          }
                        >
                          <span className="tm-gs__barlabel tw-nowrap">
                            {o.label}
                          </span>
                          <span className="tm-gs__bartrack" aria-hidden>
                            <span
                              className="tm-gs__barfill"
                              data-bar
                              style={{ width: `${(o.value / OECD_MAX) * 100}%` }}
                            />
                          </span>
                          <span className="tm-gs__barval tw-nowrap">
                            {o.value}%
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="tm-gs__source">{gradReality.source}</p>
                  </aside>
                </div>
              ) : (
                <ul className="tm-gs__points tm-gs__points--lg">
                  {t.points.map((p) => (
                    <li key={p} className="tm-gs__point">
                      <span className="tm-nav__mark" aria-hidden />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}

/* ── Slide 5 · 거점국립대 1위 — regional + animated bars chart ──────────────── */
function SlideRegional() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);
  useBarGrow(scope);
  const r = gradCompare.regional;
  return (
    <section className="tm-gs" aria-label="거점국립대 1위" ref={scope}>
      <div className="tm-shell tm-gs__shell">
        <div className="tm-gs__split">
          <div className="tm-gs__col" data-reveal>
            <p className="tm-label tm-label--accent">Benchmark · 타대 비교</p>
            <h2 className="tm-gs__title tw-balance">{r.title}</h2>
            <ul className="tm-gs__points">
              {r.points.map((p) => (
                <li key={p} className="tm-gs__point">
                  <span className="tm-nav__mark" aria-hidden />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <aside className="tm-gs__chart" data-reveal>
            <p className="tm-label">대학원생 규모 (2025)</p>
            <ul className="tm-gs__bars tm-gs__bars--wide">
              {gradCompare.bars.map((b) => (
                <li
                  key={b.name}
                  className={
                    "tm-gs__cbar" +
                    ("self" in b && b.self ? " tm-gs__cbar--self" : "")
                  }
                >
                  <span className="tm-gs__cbarhead">
                    <span className="tm-gs__cbarname tw-nowrap">{b.name}</span>
                    {b.delta ? (
                      <span className="tm-gs__cbardelta tw-nowrap">
                        {b.delta}
                      </span>
                    ) : null}
                  </span>
                  <span className="tm-gs__bartrack" aria-hidden>
                    <span
                      className="tm-gs__barfill"
                      data-bar
                      style={{ width: `${(b.value / BAR_MAX) * 100}%` }}
                    />
                  </span>
                  <span className="tm-gs__cbarval tw-nowrap">
                    {b.value.toLocaleString()}명
                  </span>
                </li>
              ))}
            </ul>
            <p className="tm-gs__source">{gradCompare.source}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* 10년 추이 line-chart geometry. Honest 2-point endpoints from content copy:
   부산대 6,191 → 5,525 (내림세) · KAIST 6,701 → 8,388 (오름세, 추월). */
const LINE = (() => {
  const W = 560;
  const H = 300;
  const PAD = { t: 28, r: 64, b: 36, l: 16 };
  const lo = 5000;
  const hi = 8600;
  const x0 = PAD.l;
  const x1 = W - PAD.r;
  const y = (v: number) =>
    PAD.t + (1 - (v - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
  return {
    W,
    H,
    series: [
      {
        name: "부산대",
        self: true,
        a: { x: x0, y: y(6191), v: "6,191" },
        b: { x: x1, y: y(5525), v: "5,525" },
        delta: "−10.7%",
      },
      {
        name: "KAIST",
        self: false,
        a: { x: x0, y: y(6701), v: "6,701" },
        b: { x: x1, y: y(8388), v: "8,388" },
        delta: "+25.2%",
      },
    ],
  };
})();

/* ── Slide 6 · 전국 10년 추이 — SVG LINE CHART, scrub-drawn (SIGNATURE) ─────── */
/* SPECIAL (a): each line is drawn via strokeDashoffset scrub as the chart scrolls
   through view — 부산대 내림세 vs KAIST 오름세, the signature data moment. */
function SlideNational() {
  const scope = useRef<HTMLElement>(null);
  const chart = useRef<HTMLDivElement>(null);
  useReveal(scope);
  useLineDraw(chart);
  const n = gradCompare.national;
  return (
    <section className="tm-gs tm-gs--ink tm-gs--grid" aria-label="전국 10년 추이" ref={scope}>
      <div className="tm-shell tm-gs__shell">
        <div className="tm-gs__split tm-gs__split--chart">
          <div className="tm-gs__col" data-reveal>
            <p className="tm-label tm-label--accent">Benchmark · 10년 추이</p>
            <h2 className="tm-gs__title tw-balance">{n.title}</h2>
            <ul className="tm-gs__points">
              {n.points.map((p) => (
                <li key={p} className="tm-gs__point">
                  <span className="tm-nav__mark" aria-hidden />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="tm-linechart" ref={chart} data-reveal>
            <svg
              viewBox={`0 0 ${LINE.W} ${LINE.H}`}
              className="tm-linechart__svg"
              role="img"
              aria-label="부산대 대학원생 수 내림세, KAIST 오름세 (10년 추이)"
            >
              {[0, 0.25, 0.5, 0.75, 1].map((g) => (
                <line
                  key={g}
                  className="tm-linechart__grid"
                  x1={0}
                  x2={LINE.W}
                  y1={28 + g * (LINE.H - 64)}
                  y2={28 + g * (LINE.H - 64)}
                />
              ))}
              {LINE.series.map((s) => (
                <g key={s.name} className={s.self ? "is-self" : ""}>
                  <path
                    data-line
                    className={
                      "tm-linechart__line" +
                      (s.self ? " tm-linechart__line--self" : "")
                    }
                    d={`M ${s.a.x} ${s.a.y} L ${s.b.x} ${s.b.y}`}
                  />
                  <circle
                    data-line-mark
                    className="tm-linechart__dot"
                    cx={s.a.x}
                    cy={s.a.y}
                    r={4}
                  />
                  <circle
                    data-line-mark
                    className={
                      "tm-linechart__dot" + (s.self ? " is-self" : " is-up")
                    }
                    cx={s.b.x}
                    cy={s.b.y}
                    r={5}
                  />
                  <text
                    data-line-mark
                    className={
                      "tm-linechart__tag" + (s.self ? " is-self" : "")
                    }
                    x={s.b.x + 8}
                    y={s.b.y + 4}
                  >
                    {s.name} {s.b.v}
                  </text>
                </g>
              ))}
            </svg>
            <div className="tm-linechart__axis" aria-hidden>
              <span>2015</span>
              <span>2025</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Slide 7 · 발전계획: 목표(count-up) + 현황 ─────────────────────────────── */
function SlideTargets() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);
  useCountUp(scope);
  return (
    <section className="tm-gs" aria-label="발전계획 목표와 현황" ref={scope}>
      <div className="tm-shell tm-gs__shell">
        <div className="tm-gs__head" data-reveal>
          <p className="tm-label tm-label--accent">Development · 발전계획</p>
          <h2 className="tm-gs__title tw-balance">{gradPlan.title}</h2>
          <p className="tm-gs__lead">{gradPlan.intro}</p>
        </div>
        <div className="tm-gs__targets" data-reveal>
          {gradPlan.targets.map((t) => (
            <div key={t.label} className="tm-gs__target">
              <span className="tm-gs__targetval tabular-nums">
                <StatValue raw={t.value} />
              </span>
              <span className="tm-gs__targetlabel tw-balance">{t.label}</span>
            </div>
          ))}
        </div>
        <div className="tm-gs__status" data-reveal>
          <h3 className="tm-gs__subtitle tw-balance">{gradPlan.status.title}</h3>
          <ul className="tm-gs__points tm-gs__points--two">
            {gradPlan.status.points.map((p) => (
              <li key={p} className="tm-gs__point">
                <span className="tm-nav__mark" aria-hidden />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p className="tm-gs__source">{gradPlan.status.source}</p>
        </div>
      </div>
    </section>
  );
}

/* PNU 1000 AX 생태계: 연구소 → 대학원 → 산업 → 학생 (cyclical flow). */
const ECO = [
  { k: "연구소", icon: Flask },
  { k: "대학원", icon: GraduationCap },
  { k: "산업", icon: Buildings },
  { k: "학생", icon: Student },
] as const;

/* ── Slide 8 · Top-Down 정책 — PNU 1000 AX ecosystem flow + items ──────────── */
function SlideTopDown() {
  const td = gradPlan.topdown;
  return (
    <Slide label="Top-Down 정책" variant="ink" grid>
      <Image
        className="tm-gs__watermark"
        src={brandAssets.symbolLine}
        alt=""
        aria-hidden
        width={520}
        height={500}
      />
      <div className="tm-gs__head" data-reveal>
        <p className="tm-label tm-label--accent">전략 A · 기관 주도</p>
        <h2 className="tm-gs__title tw-balance">{td.title}</h2>
      </div>
      <div className="tm-eco" data-reveal aria-label="PNU 1000 AX 생태계 흐름">
        {ECO.map((node, i) => {
          const NodeIcon = node.icon;
          return (
            <div className="tm-eco__cell" key={node.k}>
              <div className="tm-eco__node">
                <span className="tm-eco__icon" aria-hidden>
                  <NodeIcon weight="thin" />
                </span>
                <span className="tm-eco__name tw-nowrap">{node.k}</span>
              </div>
              {i < ECO.length - 1 ? (
                <span className="tm-eco__link" aria-hidden>
                  <ArrowRight weight="bold" />
                </span>
              ) : null}
            </div>
          );
        })}
        <p className="tm-eco__caption">
          URP · 패스트트랙으로 잇는 연구–교육–산업 순환 생태계
        </p>
      </div>
      <ul className="tm-gs__items" data-reveal>
        {td.items.map((it) => (
          <li key={it.name} className="tm-gs__item">
            <p className="tm-gs__itemname tw-balance">{it.name}</p>
            <p className="tm-gs__itembody">{it.body}</p>
          </li>
        ))}
      </ul>
    </Slide>
  );
}

/* ── Slide 9 · Bottom-Up 학과 주도 — connected 3-step stepper ──────────────── */
function SlideBottomUp() {
  const bu = gradPlan.bottomup;
  return (
    <Slide label="Bottom-Up 3단계" variant="bone">
      <div className="tm-gs__head" data-reveal>
        <p className="tm-label tm-label--accent">전략 B · 학과 주도</p>
        <h2 className="tm-gs__title tw-balance">{bu.title}</h2>
      </div>
      <ol className="tm-stepper" data-reveal>
        {bu.steps.map((s) => (
          <li key={s.k} className="tm-stepper__step">
            <span className="tm-stepper__node" aria-hidden>
              {s.k}
            </span>
            <span className="tm-stepper__body">
              <span className="tm-stepper__name tw-balance">{s.name}</span>
              <span className="tm-stepper__text">{s.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </Slide>
  );
}

/** Ordered light-slide sequence for /grad. One idea per slide. */
export default function GradSlides() {
  return (
    <>
      <SlideIntro />
      <SlideDiagnosisStack />
      <SlideRegional />
      <SlideNational />
      <SlideTargets />
      <SlideTopDown />
      <SlideBottomUp />
    </>
  );
}

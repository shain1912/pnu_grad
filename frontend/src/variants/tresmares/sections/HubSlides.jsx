import { useRef } from "react";
import {
  Stack,
  ShieldCheck,
  HardDrives,
  Cpu,
  Database,
  Brain,
  GearSix,
  Sparkle,
  Crown,
  CheckCircle,
} from "@phosphor-icons/react";
import { useReveal } from "@/lib/scroll";
import { hub, majors, twoAxis } from "@/lib/content";
import { useCountUp, useBarGrow } from "./gradMotion";

/**
 * P3 구심점 확립 [HOW] — 5 LIGHT one-idea slides with a VISUAL + GSAP layer,
 * matching /grad's quality (data-viz · diagram · atmosphere + light reveals).
 *
 * SLIDES (one idea each):
 *   1. 개요        — twoAxis[1] 3프레임 (조직·거버넌스·인프라), icons + grid atmosphere
 *   2. AI대학 ADP+X — frame[] 4-QUADRANT DIAGRAM (D·A·P·X) + launch/quota count-up
 *   3. 거버넌스     — hub.governance ORG-CHART DIAGRAM (총장→교육부총장→4 기구)
 *   4. 인프라      — hub.infra.motto + 3 stats (count-up; GPU 303→800 GAUGE) + 4 pillars
 *   5. 18개 융합전공 — majors 9-domain × 18 grid
 *
 * GSAP 적재적소·가끔: most slides keep the light `useReveal` entrance. The ONE
 * special beat is the 인프라 slide — count-up on the 3 stats + the GPU 303→800
 * gauge bar growing from 0 (useCountUp + useBarGrow from gradMotion). Everything
 * gates behind prefers-reduced-motion via gsap.context + ctx.revert().
 */

const HOW = twoAxis[1];
const FRAME_ICONS = [Stack, ShieldCheck, HardDrives];
const FRAME_HINTS = [
  "AI대학 ADP+X · 18개 융합전공",
  "총장 직속 4대 전담 기구",
  "PNU-AXIS · 5,000억 인프라",
];

const ADP_ICONS = {
  D: Database,
  A: Brain,
  P: GearSix,
  X: Sparkle,
};

/* 4 infra pillars: PNU-AXIS(GPU) · 허브 스페이스(공간) · MLOps(플랫폼) · MLSecOps(보안) */
const PILLAR_ICONS = [Cpu, HardDrives, GearSix, ShieldCheck];

const TOTAL_MAJORS = majors.reduce((n, d) => n + d.items.length, 0);

/* GPU gauge geometry — honest endpoints from content "303 → 800". */
const GPU = { from: 303, to: 800 };

function Slide({
  label,
  variant,
  grid,
  ghost,
  children,
}) {
  const scope = useRef(null);
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
      {ghost ? (
        <span className="tm-gs__ghost" aria-hidden>
          {ghost}
        </span>
      ) : null}
      <div className="tm-shell tm-gs__shell">{children}</div>
    </section>
  );
}

/* ── Slide 1 · 개요 — twoAxis[1] 3프레임 (조직·거버넌스·인프라) ─────────────── */
function SlideOverview() {
  const FRAMES = ["조직", "거버넌스", "인프라"];
  return (
    <Slide label="구심점 확립 개요" grid ghost="HOW">
      <div className="tm-gs__head" data-reveal>
        <p className="tm-label tm-label--accent">
          {HOW.numeral} · {HOW.role} — {HOW.title}
        </p>
        <h2 className="tm-gs__title tm-gs__title--lg tw-balance">{HOW.en}</h2>
        <p className="tm-gs__lead">{HOW.desc}</p>
      </div>
      <div className="tm-hubfr" data-reveal>
        {FRAMES.map((f, i) => {
          const Icon = FRAME_ICONS[i] ?? Stack;
          return (
            <article key={f} className="tm-hubfr__cell">
              <span className="tm-hubfr__idx" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="tm-hubfr__icon" aria-hidden>
                <Icon weight="thin" />
              </span>
              <span className="tm-hubfr__name">{f}</span>
              <span className="tm-hubfr__hint tw-balance">{FRAME_HINTS[i]}</span>
            </article>
          );
        })}
      </div>
    </Slide>
  );
}

/* ── Slide 2 · AI대학 ADP+X — 4-quadrant diagram + launch/quota count-up ─────── */
function SlideOrg() {
  const scope = useRef(null);
  useReveal(scope);
  useCountUp(scope);
  const o = hub.org;
  return (
    <section
      ref={scope}
      className="tm-gs tm-gs--bone tm-gs--grid"
      aria-label="AI대학 ADP+X 모델"
    >
      <span className="tm-gs__ghost tm-gs__ghost--no" aria-hidden>
        +X
      </span>
      <div className="tm-shell tm-gs__shell">
        <div className="tm-gs__head" data-reveal>
          <p className="tm-label tm-label--accent">학사조직 · AI대학</p>
          <h2 className="tm-gs__title tw-balance">{o.title}</h2>
          <div className="tm-hubq" aria-hidden={false}>
            <span className="tm-hubq__item">
              <span
                className="tm-hubq__val tabular-nums"
                data-count={2027}
                data-suffix="년 3월 출범"
              >
                2027년 3월 출범
              </span>
            </span>
            <span className="tm-hubq__sep" aria-hidden>
              ·
            </span>
            <span className="tm-hubq__item">
              <span
                className="tm-hubq__val tabular-nums"
                data-count={424}
                data-prefix="학부 "
                data-suffix="명"
              >
                학부 424명
              </span>
            </span>
          </div>
        </div>

        {/* 4-quadrant ADP+X diagram */}
        <div className="tm-quad" data-reveal aria-label="ADP+X 4분면 모델">
          {o.frame.map((f) => {
            const Icon = ADP_ICONS[f.k] ?? Sparkle;
            return (
              <article
                key={f.k}
                className={
                  "tm-quad__cell" + (f.k === "X" ? " tm-quad__cell--x" : "")
                }
              >
                <span className="tm-quad__k" aria-hidden>
                  {f.k}
                </span>
                <span className="tm-quad__icon" aria-hidden>
                  <Icon weight="thin" />
                </span>
                <span className="tm-quad__name tw-nowrap">{f.name}</span>
                <span className="tm-quad__body tw-balance">{f.body}</span>
              </article>
            );
          })}
          <span className="tm-quad__core" aria-hidden>
            ADP+X
          </span>
        </div>

        <div className="tm-gs__head" data-reveal>
          <p className="tm-hub__note tw-balance">{o.majorsNote}</p>
          <p className="tm-hub__note tm-hub__note--muted tw-balance">{o.note}</p>
        </div>
      </div>
    </section>
  );
}

/* ── Slide 3 · 거버넌스 (NEW) — org-chart diagram + status emphasized ────────── */
function SlideGovernance() {
  const g = hub.governance;
  return (
    <Slide label="AI 거버넌스" variant="ink" grid ghost="가동">
      <div className="tm-gs__head" data-reveal>
        <p className="tm-label tm-label--accent">거버넌스 · 운영 조직</p>
        <h2 className="tm-gs__title tw-balance">{g.title}</h2>
        <p className="tm-gs__lead">{g.body}</p>
      </div>

      {/* Org-chart: 리더십 lead (총장→교육부총장→운영위) → 4 기구 cards */}
      <div className="tm-org" data-reveal aria-label="AI 거버넌스 조직도">
        <div className="tm-org__lead">
          <span className="tm-org__leadicon" aria-hidden>
            <Crown weight="thin" />
          </span>
          <p className="tm-org__leadtext tw-balance">{g.lead}</p>
        </div>
        <span className="tm-org__stem" aria-hidden />
        <ul className="tm-org__bodies">
          {g.bodies.map((b) => (
            <li key={b.name} className="tm-org__body">
              <span className="tm-org__bodyname tw-balance">{b.name}</span>
              <span className="tm-org__bodytext tw-balance">{b.body}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="tm-org__status" data-reveal>
        <span className="tm-org__statusicon" aria-hidden>
          <CheckCircle weight="fill" />
        </span>
        <span className="tw-balance">{g.status}</span>
      </p>
    </Slide>
  );
}

/* ── Slide 4 · 인프라 — motto + count-up stats (GPU gauge) + 4 pillars ───────── */
/* SPECIAL beat: count-up on the 3 stats + the GPU 303→800 gauge growing from 0. */
function SlideInfra() {
  const scope = useRef(null);
  useReveal(scope);
  useCountUp(scope);
  useBarGrow(scope);
  const inf = hub.infra;
  const gpuPct = (GPU.from / GPU.to) * 100;
  return (
    <section
      ref={scope}
      className="tm-gs tm-gs--ink tm-gs--grid"
      aria-label="AI 인프라 확충"
    >
      <div className="tm-shell tm-gs__shell">
        <div className="tm-gs__head" data-reveal>
          <p className="tm-label tm-label--accent">인프라 · 확충·통합</p>
          <h2 className="tm-gs__title tw-balance">{inf.title}</h2>
          <p className="tm-gs__motto">{inf.motto}</p>
        </div>

        {/* GPU gauge — 303 → 800 (count-up + bar grow) */}
        <div className="tm-gauge" data-reveal aria-label="GPU 303에서 800으로 통합">
          <div className="tm-gauge__head">
            <span className="tm-gauge__label">GPU · 분산 → 통합 허브</span>
            <span className="tm-gauge__nums tabular-nums">
              <span data-count={GPU.from}>{GPU.from}</span>
              <span className="tm-gauge__arrow" aria-hidden>
                →
              </span>
              <span className="tm-gauge__to" data-count={GPU.to}>
                {GPU.to}
              </span>
            </span>
          </div>
          <span className="tm-gauge__track" aria-hidden>
            <span
              className="tm-gauge__fill tm-gauge__fill--base"
              style={{ width: `${gpuPct}%` }}
            />
            <span className="tm-gauge__fill" data-bar style={{ width: "100%" }} />
          </span>
        </div>

        {/* remaining 2 stats-up cards */}
        <div className="tm-hubstats" data-reveal>
          {inf.stats.slice(1).map((s) => (
            <div key={s.label} className="tm-hubstat">
              <span className="tm-hubstat__val tabular-nums">
                <StatValue raw={s.value} />
              </span>
              <span className="tm-hubstat__label tw-balance">{s.label}</span>
            </div>
          ))}
        </div>

        {/* 4 infra pillars */}
        <div className="tm-hubpil" data-reveal>
          {inf.pillars.map((p, i) => {
            const Icon = PILLAR_ICONS[i] ?? Cpu;
            return (
              <article key={p.name} className="tm-hubpil__cell">
                <span className="tm-hubpil__icon" aria-hidden>
                  <Icon weight="thin" />
                </span>
                <span className="tm-hubpil__name tw-balance">{p.name}</span>
                <span className="tm-hubpil__body tw-balance">{p.body}</span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* count-up helper for stats that lead with a number (e.g. "5,000억 원"). */
function StatValue({ raw }) {
  const m = raw.match(/^([+\-−]?)(\d[\d,]*)(\.\d+)?(.*)$/);
  if (!m) return <>{raw}</>;
  const sign = m[1] === "−" || m[1] === "-" ? "−" : m[1] === "+" ? "+" : "";
  const intPart = m[2].replace(/,/g, "");
  const dec = m[3] ?? "";
  const count = Number(intPart + dec);
  const suffix = m[4] ?? "";
  return (
    <span
      data-count={count}
      data-decimals={dec ? dec.length - 1 : 0}
      data-prefix={sign}
      data-suffix={suffix}
    >
      {sign}
      {count.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

/* ── Slide 5 · AX 18개 융합전공 (NEW) — 9-domain × 18 grid ────────────────────── */
function SlideMajors() {
  return (
    <Slide label="AX 18개 융합전공" variant="bone">
      <div className="tm-gs__head" data-reveal>
        <p className="tm-label tm-label--accent">
          AX 융합전공 · {majors.length}개 분야 {TOTAL_MAJORS}개 전공
        </p>
        <h2 className="tm-gs__title tw-balance">
          도메인을 가로지르는 18개 AX 융합전공
        </h2>
      </div>
      <ul className="tm-majors" data-reveal>
        {majors.map((d, i) => (
          <li key={d.domain} className="tm-majors__domain">
            <div className="tm-majors__head">
              <span className="tm-majors__idx" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="tm-majors__name tw-balance">{d.domain}</span>
              <span className="tm-majors__count tabular-nums">
                {d.items.length}
              </span>
            </div>
            <ul className="tm-majors__list">
              {d.items.map((it) => (
                <li key={it} className="tm-majors__item tw-balance">
                  {it}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Slide>
  );
}

/** Ordered light-slide sequence for /hub. One idea per slide. */
export default function HubSlides() {
  return (
    <>
      <SlideOverview />
      <SlideOrg />
      <SlideGovernance />
      <SlideInfra />
      <SlideMajors />
    </>
  );
}

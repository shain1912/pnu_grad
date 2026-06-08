"use client";

import { useRef } from "react";
import {
  HardDrives,
  Stack,
  Cube,
  GitBranch,
  ShieldCheck,
} from "@phosphor-icons/react";
import { hub } from "@/lib/content";
import { useReveal } from "@/lib/scroll";
import { useCountUp } from "./gradMotion";

/* 4 pillar icons (order matches hub.infra.pillars). */
const PILLAR_ICONS = [
  Stack, // PNU-AXIS
  Cube, // AI 혁신 허브 스페이스
  GitBranch, // MLOps 플랫폼
  ShieldCheck, // MLSecOps
];

/* GPU 게이지 — "303 → 800" 두 수치를 추출. */
const GPU = hub.infra.stats[0]; // { value: "303 → 800", label }
const GPU_PARTS = GPU.value.match(/(\d[\d,]*)\D+(\d[\d,]*)/);
const GPU_FROM = GPU_PARTS ? Number(GPU_PARTS[1].replace(/,/g, "")) : 303;
const GPU_TO = GPU_PARTS ? Number(GPU_PARTS[2].replace(/,/g, "")) : 800;
const GPU_BASE_PCT = Math.round((GPU_FROM / GPU_TO) * 100);

/* The remaining stats (5,000억 원 · 10,067㎡) → leading number count-up. */
function parseStat(value) {
  const m = value.match(/^(\D*)(\d[\d,]*)(.*)$/);
  if (!m) return null;
  return { pre: m[1], n: Number(m[2].replace(/,/g, "")), post: m[3] };
}

/**
 * P3 인프라 — sticky split(left motto pins / right scrolls). 시각화:
 *   · GPU 303→800 게이지 (count-up + 골드 fill)
 *   · 나머지 stats count-up
 *   · 4 pillars(PNU-AXIS / 허브 스페이스 / MLOps / MLSecOps) + 아이콘
 * .mono-goldwash 유지(자체 처리) → token-driven 색으로 다크에서 가독.
 */
export default function HubInfra() {
  const root = useRef(null);
  useReveal(root);
  useCountUp(root);

  return (
    <section ref={root} className="mono-section mono-goldwash">
      <div className="mono-section__inner">
        <div className="mono-split">
          {/* LEFT — pinned via CSS sticky */}
          <div className="mono-split__sticky" data-reveal>
            <span className="mono-label !text-[var(--gold)]">
              인프라 / INFRASTRUCTURE
            </span>
            <h2
              className="mt-4 text-balance font-heavy text-3xl uppercase leading-[0.98] tracking-tight text-[var(--text)] md:text-5xl"
              style={{ wordBreak: "keep-all" }}
            >
              {hub.infra.title}
            </h2>
            <p className="mt-5 font-mono text-sm italic tracking-wider text-[var(--gold)]">
              &ldquo;{hub.infra.motto}&rdquo;
            </p>
          </div>

          {/* RIGHT — scrolls past the fixed left column */}
          <div className="flex flex-col gap-3">
            {/* GPU 303 → 800 GAUGE */}
            <div
              className="flex flex-col rounded-xl border border-[rgba(201,162,39,0.4)] bg-[rgba(201,162,39,0.06)] p-5"
              data-reveal
            >
              <div className="flex items-center gap-3">
                <span className="hub-icon shrink-0" aria-hidden>
                  <HardDrives size={18} weight="duotone" />
                </span>
                <span className="text-balance text-xs leading-snug text-[var(--muted)]">
                  {GPU.label}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2 font-display tabular-nums">
                <span className="text-xl font-extrabold text-[var(--metal)]">
                  <span className="hub-count" data-count={GPU_FROM}>
                    0
                  </span>
                </span>
                <span className="text-sm text-[var(--gold)]">→</span>
                <span className="text-3xl font-extrabold tracking-tight text-[var(--gold)] md:text-4xl">
                  <span className="hub-count" data-count={GPU_TO}>
                    0
                  </span>
                </span>
                <span className="ml-1 font-mono text-xs text-[var(--muted)]">
                  GPU
                </span>
              </div>
              {/* gauge: gold fill (=800) with a darker base segment (=303) */}
              <div className="hub-gauge mt-4" role="img" aria-label={GPU.value}>
                <span className="hub-gauge__fill" style={{ width: "100%" }}>
                  <span
                    className="hub-gauge__base"
                    style={{ width: `${GPU_BASE_PCT}%` }}
                  />
                </span>
              </div>
              <div className="mt-1.5 flex justify-between font-mono text-[0.6rem] text-[var(--muted)]">
                <span>분산 {GPU_FROM}</span>
                <span>통합 허브 {GPU_TO}</span>
              </div>
            </div>

            {/* remaining stats */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {hub.infra.stats.slice(1).map((s) => {
                const p = parseStat(s.value);
                return (
                  <div
                    key={s.label}
                    className="flex flex-col rounded-xl border border-[var(--hairline)] bg-[rgba(201,162,39,0.06)] p-5"
                    data-reveal
                  >
                    <span className="font-display text-2xl font-extrabold leading-tight tracking-tight text-[var(--gold)] tabular-nums md:text-3xl">
                      {p ? (
                        <>
                          {p.pre}
                          <span className="hub-count" data-count={p.n}>
                            0
                          </span>
                          {p.post}
                        </>
                      ) : (
                        s.value
                      )}
                    </span>
                    <span
                      className="mt-2 text-balance text-xs leading-snug text-[var(--muted)]"
                      style={{ wordBreak: "keep-all" }}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 4 pillars */}
            {hub.infra.pillars.map((p, i) => {
              const Icon = PILLAR_ICONS[i] ?? Stack;
              return (
                <div
                  key={p.name}
                  className="flex items-start gap-3.5 rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-5"
                  data-reveal
                >
                  <span className="hub-icon mt-0.5 shrink-0" aria-hidden>
                    <Icon size={18} weight="duotone" />
                  </span>
                  <div>
                    <h3
                      className="text-base font-medium text-[var(--text)]"
                      style={{ wordBreak: "keep-all" }}
                    >
                      {p.name}
                    </h3>
                    <p
                      className="mt-1 text-balance text-sm leading-relaxed text-[var(--metal)]"
                      style={{ wordBreak: "keep-all" }}
                    >
                      {p.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import {
  Crown,
  GraduationCap,
  BookOpen,
  Flask,
  Stack,
  type IconProps,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";
import { hub } from "@/lib/content";
import { useReveal } from "@/lib/scroll";
import { useCountUp } from "./gradMotion";

/* 4 기구 icons (order matches hub.governance.bodies). */
const BODY_ICONS: ComponentType<IconProps>[] = [
  GraduationCap, // AI대학
  BookOpen, // AI융합교육원
  Flask, // 장영실 AI융합연구원
  Stack, // AX 디지털혁신본부
];

/* Pull the leading integer out of the status line so it can count up
   ("3개 기구 모두 실제 가동 중" → 3 + " 기구 모두 실제 가동 중"). */
function parseStatus(status: string): { count: number; rest: string } | null {
  const m = status.match(/^(\d+)(.*)$/);
  if (!m) return null;
  return { count: Number(m[1]), rest: m[2] };
}

/**
 * P3 거버넌스 — 총장 직속 4대 기구를 ORG-CHART 다이어그램으로 렌더.
 * 총장 → 교육부총장(집행 총괄) → 운영위 spine, then the 4 bodies fan out as
 * cards (name + body). status("…실제 가동 중")를 count-up + pulse로 강조.
 * Light useReveal entrance; renders on a CREAM alternation slide so ALL colours
 * are token-driven (var(--text/--metal/--muted/--gold/--surface/--hairline)).
 */
export default function HubGovernance() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  useCountUp(root);

  const status = parseStatus(hub.governance.status);

  return (
    <section
      ref={root}
      className="mono-section"
      aria-label="AI 거버넌스 조직도"
    >
      <span className="hub-ghost" aria-hidden>
        AX
      </span>
      <div className="mono-section__inner">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mono-label !text-[var(--gold)]" data-reveal>
              거버넌스 / GOVERNANCE
            </span>
            <h2
              className="mt-3 text-balance font-heavy text-3xl uppercase leading-[0.98] tracking-tight text-[var(--text)] md:text-5xl"
              data-reveal
              style={{ wordBreak: "keep-all" }}
            >
              {hub.governance.title}
            </h2>
          </div>
          <p
            className="max-w-md text-balance text-sm leading-relaxed text-[var(--metal)]"
            data-reveal
            style={{ wordBreak: "keep-all" }}
          >
            {hub.governance.body}
          </p>
        </div>

        {/* ── ORG CHART ───────────────────────────────────────── */}
        <div className="hub-org mt-12">
          {/* 총장 (최고 권한) */}
          <div className="hub-org__node hub-org__node--head" data-reveal>
            <span className="hub-icon mb-1" aria-hidden>
              <Crown size={20} weight="duotone" />
            </span>
            <span className="hub-org__role">총장 · 최고 권한</span>
            <span className="hub-org__name">총장 직속</span>
          </div>

          <span className="hub-org__spine" aria-hidden data-reveal />

          {/* 교육부총장 — 집행 총괄 */}
          <div className="hub-org__node" data-reveal>
            <span className="hub-org__role">교육부총장 · 집행 총괄</span>
            <span className="hub-org__name tw-balance">
              AI 거점대학 사업 집행 총괄
            </span>
            <span className="hub-org__sub" style={{ wordBreak: "keep-all" }}>
              {hub.governance.lead}
            </span>
          </div>

          <span className="hub-org__spine" aria-hidden data-reveal />

          {/* 4 기구 — name + body */}
          <div className="hub-org__bodies">
            {hub.governance.bodies.map((b, i) => {
              const Icon = BODY_ICONS[i] ?? Stack;
              return (
                <article key={b.name} className="hub-body" data-reveal>
                  <span className="hub-body__dot" aria-hidden />
                  <div className="flex items-center justify-between">
                    <span className="hub-icon" aria-hidden>
                      <Icon size={18} weight="duotone" />
                    </span>
                    <span className="hub-body__num">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3
                    className="hub-body__name"
                    style={{ wordBreak: "keep-all" }}
                  >
                    {b.name}
                  </h3>
                  <p
                    className="hub-body__desc"
                    style={{ wordBreak: "keep-all" }}
                  >
                    {b.body}
                  </p>
                </article>
              );
            })}
          </div>

          {/* status — 실제 가동 중 (count-up + pulse) */}
          <div className="mt-9 flex justify-center" data-reveal>
            <span className="hub-status">
              <span className="hub-status__pulse" aria-hidden />
              {status ? (
                <span>
                  <span className="hub-count" data-count={status.count}>
                    0
                  </span>
                  {status.rest}
                </span>
              ) : (
                <span>{hub.governance.status}</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

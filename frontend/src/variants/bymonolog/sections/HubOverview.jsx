"use client";

import { useRef } from "react";
import { twoAxis } from "@/lib/content";
import { useReveal } from "@/lib/scroll";

const HOW = twoAxis[1]; // 구심점 확립

const FRAMES = [
  { k: "01", name: "조직", body: "AI대학 (ADP+X 모델) · 18개 융합전공" },
  { k: "02", name: "거버넌스", body: "총장 직속 4대 기구 · 전사 거버넌스" },
  { k: "03", name: "인프라", body: "PNU-AXIS GPU 허브 · 혁신 허브 스페이스" },
];

/** P3-1 개요 — twoAxis[1] + 3프레임(조직·거버넌스·인프라). Light entrance. */
export default function HubOverview() {
  const root = useRef(null);
  useReveal(root);

  return (
    <section ref={root} className="mono-section">
      <div className="mono-section__inner">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <span className="mono-label" data-reveal>
            {HOW.numeral} 구심점 확립 / {HOW.role}
          </span>
          <span className="mono-label" data-reveal>
            조직 · 거버넌스 · 인프라
          </span>
        </div>

        <h1
          className="mt-6 max-w-3xl text-balance font-heavy text-4xl uppercase leading-[0.98] tracking-tight text-[var(--text)] md:text-6xl"
          data-reveal
        >
          {HOW.title}
        </h1>
        <p
          className="mt-4 max-w-2xl text-balance text-base leading-relaxed text-[var(--muted)]"
          data-reveal
        >
          {HOW.desc}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {FRAMES.map((f) => (
            <div
              key={f.k}
              className="flex flex-col rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-5"
              data-reveal
            >
              <span className="font-heavy text-2xl leading-none text-[var(--gold)]">
                {f.k}
              </span>
              <span className="mt-3 text-base font-medium text-[var(--text)]">
                {f.name}
              </span>
              <p className="mt-2 text-balance text-xs leading-relaxed text-[var(--metal)]">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

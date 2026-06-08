"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { metrics, govTasks } from "@/lib/content";

export default function Metrics() {
  const root = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context((self) => {
      const scope = self.selector;
      const nums = scope(".metric-num");

      if (reduced) {
        // Static: render final values immediately
        nums.forEach((el) => {
          el.textContent = el.dataset.value ?? el.textContent;
        });
        return;
      }

      nums.forEach((el) => {
        const target = Number(el.dataset.value ?? "0");
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 80%" },
          onUpdate: () => {
            el.textContent = Math.round(obj.v).toLocaleString("en-US");
          },
        });
      });

      gsap.from(scope(".metric-cell"), {
        opacity: 0,
        y: 28,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: scope(".metric-grid")[0], start: "top 78%" },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="metrics"
      ref={root}
      className="mono-cream mono-section"
    >
      <div className="mono-section__inner">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <span className="mono-label">핵심 지표 / KEY METRICS</span>
          <span className="mono-label">2023 — 현재</span>
        </div>

        <div className="metric-grid mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[rgba(26,26,27,0.16)] bg-[rgba(26,26,27,0.16)] sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className="metric-cell flex flex-col bg-[var(--cream)] p-7 md:p-8"
            >
              {/* Yale by-the-numbersed eyebrow + small label */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[0.68rem] tracking-[0.16em] text-[var(--gold)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mono-label">{m.label}</span>
              </div>
              <div className="mt-7 flex items-baseline gap-1">
                <span
                  className="metric-num font-display text-6xl font-extrabold leading-[0.9] tracking-tight text-[var(--cream-text)] tabular-nums md:text-7xl"
                  data-value={m.value}
                >
                  0
                </span>
                <span className="font-display text-xl font-bold text-[rgba(26,26,27,0.7)] md:text-2xl">
                  {m.unit}
                </span>
              </div>
              <div className="mono-hairline mt-7" />
              <p className="mt-3 text-xs leading-relaxed text-[rgba(26,26,27,0.55)]">
                {m.note}
              </p>
            </div>
          ))}
        </div>

        {/* 교육부 3대 과업 — 본 사업은 과업Ⅰ(구심점 확립)에 집중 */}
        <div className="mt-12">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[var(--cream-text)] md:text-3xl">
              {govTasks.title}
            </h3>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[rgba(26,26,27,0.5)]">
              {govTasks.subtitle}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            {govTasks.items.map((t) => (
              <div
                key={t.no}
                className={`flex flex-col gap-3 rounded-2xl border p-6 transition-colors ${
                  t.focus
                    ? "border-[var(--gold)] bg-[rgba(201,162,39,0.08)]"
                    : "border-[rgba(26,26,27,0.16)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-heavy text-4xl leading-none ${
                      t.focus ? "text-[var(--gold)]" : "text-[rgba(26,26,27,0.35)]"
                    }`}
                  >
                    {t.no}
                  </span>
                  {t.focus ? (
                    <span className="rounded-full bg-[var(--gold)] px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--cream)]">
                      본 사업 집중
                    </span>
                  ) : null}
                </div>
                <p className="text-balance text-sm font-medium leading-snug text-[var(--cream-text)]">
                  {t.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

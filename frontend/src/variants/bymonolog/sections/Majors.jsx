"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { majors } from "@/lib/content";

const TOTAL_MAJORS = majors.reduce((n, d) => n + d.items.length, 0);

export default function Majors() {
  const root = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context((self) => {
      const scope = self.selector;
      gsap.from(scope(".major-card"), {
        opacity: 0,
        y: 28,
        stagger: 0.05,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: { trigger: scope(".major-grid")[0], start: "top 84%" },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id="majors" ref={root} className="mono-section">
      <div className="mono-section__inner">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mono-label">AX 융합전공 / CONVERGENCE MAJORS</span>
            <h2 className="mt-3 font-heavy text-3xl uppercase tracking-tight text-[var(--text)] md:text-5xl">
              {majors.length}개 분야 · {TOTAL_MAJORS}개 융합전공
            </h2>
          </div>
          <span className="mono-label">AI대학 · 대학원 연계 BK21</span>
        </div>

        <div className="major-grid mt-9 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {majors.map((d, i) => (
            <article
              key={d.domain}
              className="major-card flex flex-col rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-4"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[0.62rem] tracking-[0.16em] text-[var(--gold)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-sm font-medium text-[var(--text)]">
                  {d.domain}
                </h3>
                <span className="ml-auto font-mono text-[0.6rem] text-[var(--muted)]">
                  {d.items.length}
                </span>
              </div>
              <div className="mono-hairline mt-3" />
              <ul className="mt-3 flex flex-col gap-1.5">
                {d.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--gold)]" />
                    <span className="text-xs leading-relaxed text-[var(--metal)]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

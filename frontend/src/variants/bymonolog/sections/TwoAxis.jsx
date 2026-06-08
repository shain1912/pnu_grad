"use client";

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "@phosphor-icons/react";
import { twoAxis, overview } from "@/lib/content";

const AXIS_HREF = {
  grad: "/bymonolog/grad",
  hub: "/bymonolog/hub",
};

export default function TwoAxis() {
  const root = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context((self) => {
      const scope = self.selector;
      gsap.from(scope(".axis-card"), {
        opacity: 0,
        y: 40,
        stagger: 0.14,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: scope(".axis-grid")[0], start: "top 80%" },
      });
      gsap.from(scope(".axis-connector"), {
        scaleX: 0,
        transformOrigin: "left",
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: scope(".axis-grid")[0], start: "top 78%" },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id="twoaxis" ref={root} className="mono-section">
      <div className="mono-section__inner">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <span className="mono-label">2축 내러티브 / TWO-AXIS NARRATIVE</span>
          <span className="mono-label">{overview.axisLine}</span>
        </div>

        <h2 className="mt-5 max-w-3xl font-heavy text-4xl uppercase leading-[0.95] tracking-tight text-[var(--text)] md:text-6xl">
          {overview.vision}
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
          {overview.lead}
        </p>

        <div className="axis-grid relative mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* WHY → HOW connector */}
          <span
            className="axis-connector pointer-events-none absolute left-1/2 top-1/2 hidden h-px w-12 -translate-x-1/2 -translate-y-1/2 bg-[var(--gold)] md:block"
            aria-hidden
          />
          {twoAxis.map((a) => (
            <Link key={a.id}
              to={AXIS_HREF[a.id]}
              className="axis-card group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--hairline)] p-8 transition-colors duration-300 hover:border-[rgba(201,162,39,0.6)] md:p-10"
              style={{
                background:
                  "radial-gradient(120% 100% at 100% 0%, rgba(201,162,39,0.1) 0%, var(--surface) 55%)",
              }}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-heavy text-6xl leading-none text-[var(--gold)] md:text-7xl">
                  {a.numeral}
                </span>
                <span className="rounded-full border border-[rgba(201,162,39,0.4)] px-3 py-1 font-mono text-xs tracking-[0.16em] text-[var(--gold)]">
                  {a.role}
                </span>
              </div>
              <h3 className="mt-6 flex items-center gap-2 text-3xl font-bold tracking-tight text-[var(--text)] md:text-4xl">
                {a.title}
                <ArrowUpRight
                  size={26}
                  weight="bold"
                  className="text-[var(--muted)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--gold)]"
                  aria-hidden
                />
              </h3>
              <span className="mono-label mt-2">{a.en}</span>
              <p className="mt-5 max-w-md text-balance text-sm leading-relaxed text-[var(--metal)] md:text-base">
                {a.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

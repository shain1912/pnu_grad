"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "@phosphor-icons/react";
import { services } from "@/lib/content";

export default function Services() {
  const root = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context((self) => {
      const scope = self.selector;
      gsap.from(scope(".svc-row"), {
        opacity: 0,
        y: 32,
        stagger: 0.1,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: scope(".svc-list")[0], start: "top 80%" },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id="services" ref={root} className="mono-section">
      <div className="mono-section__inner">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <span className="mono-label">핵심 AI 서비스 / CORE SERVICES</span>
          <span className="mono-label">A.U.R.A 2.0</span>
        </div>

        <h2 className="mt-5 max-w-2xl font-heavy text-4xl uppercase leading-[0.95] tracking-tight text-[var(--text)] md:text-6xl">
          현장에서 작동하는 AI
        </h2>

        {/* Editorial numbered rows with hover-reveal detail */}
        <div className="svc-list mt-12 border-t border-[var(--hairline)]">
          {services.map((s, i) => (
            <article
              key={s.name}
              className="svc-row group grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-3 border-b border-[var(--hairline)] py-7 transition-colors duration-300 hover:bg-[var(--surface)] md:grid-cols-[5rem_1.4fr_1fr_auto] md:items-center md:gap-x-8 md:px-4"
            >
              {/* index */}
              <span className="font-heavy text-3xl leading-none tracking-tight text-[var(--gold)] tabular-nums transition-transform duration-300 group-hover:translate-x-1 md:text-4xl">
                0{i + 1}
              </span>

              {/* name */}
              <h3 className="text-2xl font-medium text-[var(--text)] md:text-3xl">
                {s.name}
              </h3>

              {/* tag */}
              <p className="col-span-2 text-sm leading-relaxed text-[var(--metal)] md:col-span-1">
                {s.tag}
              </p>

              {/* arrow */}
              <ArrowUpRight
                size={28}
                weight="bold"
                className="col-span-2 justify-self-start text-[var(--muted)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--gold)] md:col-span-1 md:justify-self-end"
                aria-hidden
              />

              {/* hover-reveal point list (always visible on mobile for legibility) */}
              <ul className="col-span-2 grid max-h-40 grid-cols-1 gap-x-8 gap-y-2 overflow-hidden opacity-100 transition-all duration-500 sm:grid-cols-2 md:col-start-2 md:col-end-5 md:mt-3 md:max-h-0 md:opacity-0 md:group-hover:mt-3 md:group-hover:max-h-40 md:group-hover:opacity-100">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--gold)]" />
                    <span className="text-sm leading-relaxed text-[var(--metal)]">
                      {p}
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

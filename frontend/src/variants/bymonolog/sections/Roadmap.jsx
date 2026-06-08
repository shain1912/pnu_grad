"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { roadmap } from "@/lib/content";

export default function Roadmap() {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    // Upgrade from the readable static base to the animated reveal.
    el.classList.add("mono-roadmap--animated");
    const ctx = gsap.context((self) => {
      const scope = self.selector;
      const track = scope(".mono-roadmap__track")[0];

      // Progress line sweeps in (harvested from curaclimate), triggered on the
      // card's entrance — no long pin; the sticky stack provides the lock.
      gsap.fromTo(
        scope(".mono-roadmap__line i"),
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.3,
          ease: "power2.out",
          scrollTrigger: { trigger: track, start: "top 78%" },
        }
      );

      // Markers + milestone cards rise/stagger track enters.
      scope(".mono-roadmap__col").forEach((col) => {
        gsap.from(col.querySelectorAll<HTMLElement>(".mono-roadmap__card"), {
          y: 36,
          autoAlpha: 0,
          stagger: 0.07,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: col, start: "top 82%" },
        });
      });

      gsap.from(scope(".mono-roadmap__marker"), {
        y: 24,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: track, start: "top 80%" },
      });
    }, el);

    return () => {
      ctx.revert();
      el.classList.remove("mono-roadmap--animated");
    };
  }, []);

  return (
    <section
      id="roadmap"
      ref={root}
      className="mono-section"
      aria-label="3개년 로드맵"
    >
      <span className="mono-roadmap__ghost" aria-hidden>
        2027
      </span>

      <div className="mono-section__inner">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mono-label">추진 로드맵 / ROADMAP</span>
            <h2 className="mt-3 font-heavy text-4xl uppercase tracking-tight text-[var(--text)] md:text-6xl">
              2025 — 2027
            </h2>
          </div>
          <span className="mono-label">A.U.R.A 2.0</span>
        </div>

        <div className="mono-roadmap__line" aria-hidden>
          <i />
        </div>

        <div className="mono-roadmap__track">
          {roadmap.map((stage) => (
            <article
              className="mono-roadmap__col"
              key={stage.year}
              data-active={stage.active}
            >
              <div className="mono-roadmap__marker">
                <span className="mono-roadmap__year">{stage.year}</span>
                <span className="mono-roadmap__phase">
                  <b>{stage.phase}</b>
                  <span>{stage.phaseEn}</span>
                </span>
                {stage.active && (
                  <span className="mono-pill mono-pill--solid !px-3 !py-1 !text-[0.62rem]">
                    NOW
                  </span>
                )}
              </div>
              <div className="mono-roadmap__cards">
                {stage.items.map((item) => (
                  <div className="mono-roadmap__card" key={item.text}>
                    <span className="mono-roadmap__card-tag">{item.tag}</span>
                    <p className="mono-roadmap__card-text">{item.text}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { roadmap } from "@/lib/content";

export default function Roadmap() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // cura-harvested progress line — fills on card entrance (no long pin).
      gsap.fromTo(
        ".tm-rmprogress__fill",
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: "left center",
          duration: 1.4,
          ease: "power2.inOut",
          scrollTrigger: { trigger: ".tm-rmprogress", start: "top 82%" },
        }
      );

      gsap.from(".tm-rmmarker", {
        opacity: 0,
        y: 12,
        scale: 0.6,
        transformOrigin: "center",
        stagger: 0.18,
        duration: 0.5,
        ease: "back.out(1.8)",
        scrollTrigger: { trigger: ".tm-rmprogress", start: "top 80%" },
      });

      gsap.from(".tm-rmcol", {
        opacity: 0,
        y: 28,
        stagger: 0.12,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: ".tm-roadmap__cols", start: "top 82%" },
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={scope} id="roadmap" className="tm-section tm-roadmap">
      <div className="tm-shell">
        <div className="tm-roadmap__head">
          <p className="tm-label tm-label--accent">Roadmap 2025 — 2027</p>
          <h2 className="tm-roadmap__title">3개년 추진 로드맵</h2>
        </div>

        {/* progress line + year markers */}
        <div className="tm-rmprogress">
          <span className="tm-rmprogress__fill" aria-hidden />
          <div className="tm-rmprogress__markers" aria-hidden>
            {roadmap.map((r) => (
              <span
                key={r.year}
                className={`tm-rmmarker${r.active ? " is-active" : ""}`}
              >
                <span className="tm-rmmarker__dot" />
                <span className="tm-rmmarker__cap">
                  <span className="tm-rmmarker__year">{r.year}</span>
                  <span className="tm-rmmarker__phase">{r.phaseEn}</span>
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="tm-roadmap__cols">
          {roadmap.map((r) => (
            <div
              key={r.year}
              className={`tm-rmcol${r.active ? " is-active" : ""}`}
            >
              <p className="tm-rmcol__year">
                {r.year}
                {r.active && <span className="tm-rmcol__active">Now</span>}
              </p>
              <p className="tm-rmcol__phase">
                <span className="tm-rmcol__phaseko">{r.phase}</span>
                <span className="tm-rmcol__phaseen">{r.phaseEn}</span>
              </p>
              <ul className="tm-rmcol__items">
                {r.items.map((it) => (
                  <li key={it.text} className="tm-rmcol__item">
                    <span className="tm-rmcol__tag">{it.tag}</span>
                    <span className="tm-rmcol__text">{it.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

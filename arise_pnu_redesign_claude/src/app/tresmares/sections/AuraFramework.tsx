"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { aura } from "@/lib/content";

/**
 * SIGNATURE motion (tresmares, /aura only): a pinned section with a fixed
 * left axis-nav and an SVG growth-line that draws as you scroll. Each of the
 * 4 A.U.R.A. axes activates in turn while its 전략과제 detail rises on the right.
 */
export default function AuraFramework() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const path = scope.current?.querySelector<SVGPathElement>(
        ".tm-afw__line"
      );
      const navItems = gsap.utils.toArray<HTMLElement>(".tm-afw__navitem");
      const panels = gsap.utils.toArray<HTMLElement>(".tm-afw__panel");
      const count = panels.length || 1;

      if (path) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      }

      const setActive = (idx: number) => {
        navItems.forEach((el, i) =>
          el.classList.toggle("is-active", i === idx)
        );
        panels.forEach((el, i) => el.classList.toggle("is-active", i === idx));
      };
      setActive(0);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scope.current,
          start: "top top",
          end: () => `+=${window.innerHeight * count}`,
          pin: true,
          scrub: 0.6,
          snap: count > 1 ? 1 / (count - 1) : undefined,
          onUpdate: (self) => {
            const idx = Math.min(
              count - 1,
              Math.round(self.progress * (count - 1))
            );
            setActive(idx);
          },
        },
      });

      if (path) {
        tl.to(path, { strokeDashoffset: 0, ease: "none" }, 0);
      }
      panels.forEach((panel, i) => {
        tl.fromTo(
          panel.querySelectorAll(".tm-afw__task"),
          { autoAlpha: 0, x: 18 },
          { autoAlpha: 1, x: 0, stagger: 0.05, ease: "power2.out" },
          i / count
        );
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={scope} className="tm-section tm-afw stack-card--ink">
      <div className="tm-shell tm-afw__grid">
        {/* Left — pinned axis nav + growth line */}
        <div className="tm-afw__nav">
          <p className="tm-label tm-label--accent">Signature · 4대 추진 축</p>
          <ul className="tm-afw__navlist">
            {aura.framework.map((f, i) => (
              <li key={`${f.letter}-${i}`} className="tm-afw__navitem">
                <span className="tm-afw__navletter" aria-hidden>
                  {f.letter}
                </span>
                <span className="tm-afw__navko">{f.ko}</span>
                <span className="tm-afw__naven">{f.en}</span>
              </li>
            ))}
          </ul>
          <svg
            className="tm-afw__svg"
            viewBox="0 0 80 320"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              className="tm-afw__line"
              d="M40 312 C 12 250, 68 200, 40 150 C 12 100, 68 60, 40 8"
              fill="none"
              stroke="var(--tm-accent)"
              strokeWidth="2.5"
            />
          </svg>
        </div>

        {/* Right — per-axis detail panels */}
        <div className="tm-afw__panels">
          {aura.framework.map((f, i) => (
            <article
              key={`${f.letter}-${i}-panel`}
              className={`tm-afw__panel${i === 0 ? " is-active" : ""}`}
            >
              <span className="tm-afw__panelletter" aria-hidden>
                {f.letter}
              </span>
              <h3 className="tm-afw__paneltitle tw-balance">{f.ko}</h3>
              <p className="tm-afw__panelen">{f.en}</p>
              <p className="tm-afw__paneldesc">{f.desc}</p>
              <ul className="tm-afw__tasks">
                {f.tasks.map((t) => (
                  <li key={t} className="tm-afw__task">
                    <span className="tm-nav__mark" aria-hidden />
                    {t}
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

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { achievements } from "@/lib/content";

export default function Achievements() {
  const scope = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".tm-ach__cell", {
        opacity: 0,
        y: 24,
        stagger: 0.08,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: ".tm-ach__bento", start: "top 80%" },
      });
      gsap.from(".tm-ach__listitem", {
        opacity: 0,
        x: -14,
        stagger: 0.07,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: ".tm-ach__list", start: "top 82%" },
      });
      gsap.from(".tm-tl__row", {
        opacity: 0,
        x: -16,
        stagger: 0.1,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: ".tm-tl", start: "top 82%" },
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={scope} id="achievements" className="tm-section">
      <div className="tm-shell">
        <div className="tm-ach__head">
          <p className="tm-label tm-label--accent">Achievements</p>
          <h2 className="tm-ach__title">검증된 성과와 수상 이력</h2>
        </div>

        <div className="tm-ach__bento">
          {achievements.headline.map((h, i) => (
            <div key={h.value} className="tm-ach__cell">
              <span className="tm-cell__index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className={`tm-ach__val${i === 0 ? " is-red" : ""}`}>
                {h.value}
              </p>
              <p className="tm-ach__caption">{h.label}</p>
            </div>
          ))}
        </div>

        <ul className="tm-ach__list">
          {achievements.list.map((item) => (
            <li key={item} className="tm-ach__listitem">
              <span className="tm-nav__mark" aria-hidden />
              {item}
            </li>
          ))}
        </ul>

        <div className="tm-tl">
          <p className="tm-label tm-label--accent tm-tl__label">Timeline</p>
          <ol className="tm-tl__list">
            {achievements.timeline.map((t) => (
              <li key={t.date} className="tm-tl__row">
                <span className="tm-tl__date">{t.date}</span>
                <div className="tm-tl__body">
                  <p className="tm-tl__title">{t.title}</p>
                  <p className="tm-tl__detail">{t.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { aura } from "@/lib/content";

export default function Aura() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Vision diagram cascades down its four tiers on entrance.
      gsap.from(".tm-aura__tier", {
        opacity: 0,
        y: 26,
        stagger: 0.14,
        duration: 0.75,
        ease: "power3.out",
        scrollTrigger: { trigger: ".tm-auradiagram", start: "top 78%" },
      });
      gsap.from(".tm-auraconn", {
        scaleY: 0,
        transformOrigin: "top center",
        stagger: 0.14,
        duration: 0.45,
        ease: "power2.out",
        scrollTrigger: { trigger: ".tm-auradiagram", start: "top 78%" },
      });

      // 8 / 22 / 47 count-up.
      const pillars = gsap.utils.toArray<HTMLElement>(".tm-pillar");
      pillars.forEach((p) => {
        const valEl = p.querySelector<HTMLElement>(".tm-pillar__count");
        const target = Number(p.dataset.value ?? "0");
        if (valEl) {
          const c = { v: 0 };
          gsap.to(c, {
            v: target,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: { trigger: ".tm-aura__scale", start: "top 82%" },
            onUpdate: () => {
              valEl.textContent = String(Math.round(c.v));
            },
          });
        }
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={scope} id="aura" className="tm-section tm-aura">
      <div className="tm-shell">
        <div className="tm-aura__head">
          <p className="tm-label tm-label--accent">Signature · Master Plan</p>
          <h2 className="tm-aura__title">{aura.title}</h2>
          <p className="tm-aura__sub">
            {aura.subtitle} · {aura.period} · {aura.investment}
          </p>
        </div>

        {/* Four-tier vision diagram: 비전 → 목표 → 4축 → 8블록 */}
        <div className="tm-auradiagram">
          {/* Tier 1 — Vision */}
          <div className="tm-aura__tier tm-aura__tier--vision">
            <span className="tm-aura__tierlabel">Vision · 비전</span>
            <p className="tm-aura__vision">{aura.vision}</p>
          </div>

          <span className="tm-auraconn" aria-hidden />

          {/* Tier 2 — Goal + 4 targets */}
          <div className="tm-aura__tier tm-aura__tier--goal">
            <div className="tm-aura__goal">
              <span className="tm-aura__tierlabel">Goal · 목표</span>
              <p className="tm-aura__goaltext">{aura.goal}</p>
            </div>
            <div className="tm-aura__targets">
              {aura.goalTargets.map((t) => (
                <div key={t.label} className="tm-auratarget">
                  <span className="tm-auratarget__tag">{t.tag}</span>
                  <span className="tm-auratarget__label">{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          <span className="tm-auraconn" aria-hidden />

          {/* Tier 3 — 4 axes (A.U.R.A) */}
          <div className="tm-aura__tier tm-aura__tier--axes">
            <span className="tm-aura__tierlabel">Framework · 4대 추진 축</span>
            <div className="tm-aura__axes">
              {aura.framework.map((f, i) => (
                <div key={`${f.letter}-${i}`} className="tm-auraaxis">
                  <span className="tm-auraaxis__letter" aria-hidden>
                    {f.letter}
                  </span>
                  <span className="tm-auraaxis__ko">{f.ko}</span>
                  <span className="tm-auraaxis__en">{f.en}</span>
                </div>
              ))}
            </div>
          </div>

          <span className="tm-auraconn" aria-hidden />

          {/* Tier 4 — 8 blocks */}
          <div className="tm-aura__tier tm-aura__tier--blocks">
            <span className="tm-aura__tierlabel">8 전략·실행 블록</span>
            <div className="tm-aura__blocks">
              {aura.blocks.map((b, i) => (
                <div key={`${b.axis}-${i}`} className="tm-aurablock">
                  <span className="tm-aurablock__axis" aria-hidden>
                    {b.axis}
                  </span>
                  <span className="tm-aurablock__title">{b.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 8 / 22 / 47 scale + investment */}
        <div className="tm-aura__scale">
          <div className="tm-aura__grid">
            {aura.pillars.map((p) => (
              <div key={p.labelEn} className="tm-pillar" data-value={p.value}>
                <span className="tm-pillar__val">
                  <span className="tm-pillar__count">0</span>
                </span>
                <span className="tm-pillar__label">{p.label}</span>
                <span className="tm-pillar__labelen">{p.labelEn}</span>
              </div>
            ))}
            <div className="tm-pillar tm-pillar--invest">
              <span className="tm-pillar__investval">{aura.investment}</span>
              <span className="tm-pillar__label">투자 예산</span>
              <span className="tm-pillar__labelen">Investment</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

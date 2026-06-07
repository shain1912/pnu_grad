"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "@phosphor-icons/react";
import { aura } from "@/lib/content";

/**
 * P1 비전체계도 요약 — vision → goal → 4 goalTargets → 8/22/47 pillars.
 * Light entrance reveal only (the full diagram lives on /aura).
 */
export default function VisionSummary() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from("[data-reveal]", {
        opacity: 0,
        y: 26,
        stagger: 0.1,
        duration: 0.75,
        ease: "power3.out",
        scrollTrigger: { trigger: scope.current, start: "top 78%" },
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={scope} id="vision" className="tm-section tm-vsum">
      <div className="tm-shell">
        <div className="tm-vsum__head" data-reveal>
          <p className="tm-label tm-label--accent">⭐ 비전체계도 요약</p>
          <h2 className="tm-vsum__vision tw-balance">{aura.vision}</h2>
          <p className="tm-vsum__goal">{aura.goal}</p>
        </div>

        <div className="tm-vsum__targets">
          {aura.goalTargets.map((t) => (
            <div key={t.label} className="tm-vsum__target" data-reveal>
              <span className="tm-vsum__tag">{t.tag}</span>
              <span className="tm-vsum__targetlabel">{t.label}</span>
            </div>
          ))}
        </div>

        <div className="tm-vsum__scale" data-reveal>
          {aura.pillars.map((p) => (
            <div key={p.labelEn} className="tm-vsum__pillar">
              <span className="tm-vsum__pillarval">{p.value}</span>
              <span className="tm-vsum__pillarlabel">{p.label}</span>
            </div>
          ))}
          <Link href="/tresmares/aura" className="tm-vsum__more">
            A.U.R.A. 전체 보기
            <ArrowRight size={15} weight="bold" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

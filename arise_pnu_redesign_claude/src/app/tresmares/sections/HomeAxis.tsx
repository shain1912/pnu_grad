"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "@phosphor-icons/react";
import { overview, twoAxis } from "@/lib/content";

const HREF: Record<string, string> = {
  grad: "/tresmares/grad",
  hub: "/tresmares/hub",
};

/** P1 2축 진입 — two cards linking to /grad (WHY) and /hub (HOW). */
export default function HomeAxis() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".tm-axis__col", {
        opacity: 0,
        y: 28,
        stagger: 0.14,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ".tm-axis__split", start: "top 80%" },
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={scope} className="tm-section tm-axis tm-axis--entry">
      <div className="tm-shell">
        <div className="tm-axis__head">
          <p className="tm-label tm-label--accent">Two Axes · 진입</p>
          <h2 className="tm-axis__title tw-balance">{overview.axisLine}</h2>
          <p className="tm-axis__lead">{overview.lead}</p>
        </div>

        <div className="tm-axis__split">
          {twoAxis.map((a) => (
            <Link key={a.id} href={HREF[a.id]} className="tm-axis__col">
              <div className="tm-axis__top">
                <span className="tm-axis__numeral" aria-hidden>
                  {a.numeral}
                </span>
                <span className="tm-axis__role">{a.role}</span>
              </div>
              <h3 className="tm-axis__name">{a.title}</h3>
              <p className="tm-axis__en">{a.en}</p>
              <p className="tm-axis__desc">{a.desc}</p>
              <span className="tm-axis__cta">
                자세히 보기
                <ArrowRight size={15} weight="bold" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { services } from "@/lib/content";

export default function Services() {
  const scope = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".tm-svc__cell", {
        opacity: 0,
        y: 28,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: ".tm-svc__bento", start: "top 82%" },
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={scope} id="services" className="tm-section tm-svc">
      <div className="tm-shell">
        <div className="tm-svc__head">
          <div>
            <p className="tm-label tm-label--accent">Core Services</p>
            <h2 className="tm-svc__title">자체 구축 AI 서비스·인프라</h2>
          </div>
          <p className="tm-svc__lead">
            국립대 최초 자체 구축 플랫폼부터 현장 중심 융합연구 허브까지, PNU가
            직접 만든 AX 인프라.
          </p>
        </div>

        <div className="tm-svc__bento">
          {services.map((s, i) => (
            <div key={s.name} className="tm-svc__cell">
              <span className="tm-svc__num" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="tm-svc__tag">{s.tag}</p>
              <h3 className="tm-svc__name">{s.name}</h3>
              <ul className="tm-svc__points">
                {s.points.map((p) => (
                  <li key={p} className="tm-svc__point">
                    <span className="tm-nav__mark" aria-hidden />
                    {p}
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

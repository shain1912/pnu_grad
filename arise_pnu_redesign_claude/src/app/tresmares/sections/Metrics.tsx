"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { metrics, govTasks } from "@/lib/content";

export default function Metrics() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cells = gsap.utils.toArray<HTMLElement>(".tm-cell");
      cells.forEach((cell) => {
        const numEl = cell.querySelector<HTMLElement>(".tm-cell__count");
        const target = Number(cell.dataset.value ?? "0");
        gsap.from(cell, {
          opacity: 0,
          y: 28,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: cell, start: "top 80%" },
        });
        if (numEl) {
          const counter = { v: 0 };
          gsap.to(counter, {
            v: target,
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: { trigger: cell, start: "top 70%" },
            onUpdate: () => {
              numEl.textContent = Math.round(counter.v).toLocaleString("en-US");
            },
          });
        }
      });

      gsap.from(".tm-target > *", {
        opacity: 0,
        y: 24,
        stagger: 0.12,
        duration: 0.85,
        ease: "power2.out",
        scrollTrigger: { trigger: ".tm-target", start: "top 82%" },
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={scope} id="metrics" className="tm-section">
      <div className="tm-shell">
        <div className="tm-metrics__head">
          <div>
            <p className="tm-label tm-label--accent">Key Metrics</p>
            <h2 className="tm-metrics__title">
              숫자로 증명하는 거점대학의 역량
            </h2>
          </div>
        </div>

        <div className="tm-bento">
          {metrics.map((m, i) => (
            <div key={m.label} className="tm-cell" data-value={m.value}>
              <span className="tm-cell__index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="tm-cell__caption">{m.label}</p>
              <p className="tm-cell__num">
                <span className="tm-cell__count">
                  {m.value.toLocaleString("en-US")}
                </span>
                <span className="tm-cell__unit">{m.unit}</span>
              </p>
              <p className="tm-cell__caption">{m.note}</p>
            </div>
          ))}
        </div>

        <div className="tm-gov">
          <div className="tm-gov__head">
            <p className="tm-label tm-label--accent">{govTasks.title}</p>
            <span className="tm-gov__sub">{govTasks.subtitle}</span>
          </div>
          <div className="tm-gov__grid">
            {govTasks.items.map((t) => (
              <div
                key={t.no}
                className={"tm-gov__card" + (t.focus ? " tm-gov__card--focus" : "")}
              >
                <div className="tm-gov__top">
                  <span className="tm-gov__no">{t.no}</span>
                  {t.focus ? <span className="tm-gov__badge">본 사업 집중</span> : null}
                </div>
                <p className="tm-gov__title tw-balance">{t.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

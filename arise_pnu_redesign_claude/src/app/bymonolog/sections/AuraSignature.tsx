"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { aura } from "@/lib/content";

const LETTERS = ["A", "U", "R", "A"] as const;

/**
 * SIGNATURE (only on /aura): "A.U.R.A 워드마크 핀 분할 리빌".
 * Pins the colossal A·U·R·A wordmark; on scrub the four letters split
 * outward and the 8 / 22 / 47 scale rises + counts up through the gap.
 * Reduced-motion: static split + final numbers (CSS handles layout).
 */
export default function AuraSignature() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context((self) => {
      const scope = self.selector!;
      const nums = scope(".aura-sig__num") as HTMLElement[];

      if (reduced) {
        nums.forEach((el) => {
          el.textContent = el.dataset.value ?? el.textContent;
        });
        return;
      }

      const letters = scope(".aura-sig__letter") as HTMLElement[];

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scope(".aura-sig")[0],
          start: "top top",
          end: "+=120%",
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      // Split the four letters apart (A U | R A) to open the centre gap.
      tl.to(letters[0], { xPercent: -130, ease: "none" }, 0)
        .to(letters[1], { xPercent: -45, ease: "none" }, 0)
        .to(letters[2], { xPercent: 45, ease: "none" }, 0)
        .to(letters[3], { xPercent: 130, ease: "none" }, 0)
        .to(scope(".aura-sig__word"), { opacity: 0.18, ease: "none" }, 0)
        .fromTo(
          scope(".aura-sig__scale"),
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, ease: "none" },
          0.25
        );

      // Count the 8 / 22 / 47 up as the gap opens.
      nums.forEach((el) => {
        const target = Number(el.dataset.value ?? "0");
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          ease: "none",
          scrollTrigger: {
            trigger: scope(".aura-sig")[0],
            start: "top top",
            end: "+=120%",
            scrub: 0.8,
          },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.v));
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} aria-label="A.U.R.A 규모 — 8 / 22 / 47">
      <div className="aura-sig mono-goldwash">
        <div
          className="mono-bloom"
          style={{ top: "50%", opacity: 0.7 }}
          aria-hidden
        />

        {/* Colossal splitting wordmark */}
        <div className="aura-sig__word" aria-hidden>
          {LETTERS.map((l, i) => (
            <span
              key={i}
              className={`aura-sig__letter${i === 0 ? " aura-sig__letter--accent" : ""}`}
            >
              {l}
            </span>
          ))}
        </div>

        {/* 8 / 22 / 47 rising through the gap */}
        <div className="aura-sig__scale">
          {aura.pillars.map((p) => (
            <div key={p.label} className="flex flex-col items-center text-center">
              <span
                className="aura-sig__num aura-figure-num"
                data-value={p.value}
                style={{ fontSize: "clamp(3rem, 9vw, 7rem)" }}
              >
                0
              </span>
              <span className="mt-1 text-sm font-medium text-[var(--text)]">
                {p.label}
              </span>
              <span className="mono-label !text-[0.58rem]">{p.labelEn}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

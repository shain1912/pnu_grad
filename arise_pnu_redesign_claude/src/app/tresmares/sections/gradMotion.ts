"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * /grad (tresmares · Light) special GSAP beats — used 적재적소·가끔, NOT on every
 * transition. Most slides keep the light `useReveal` from @/lib/scroll; these
 * hooks power only the 2–3 signature moments + the supporting data-viz:
 *   - useStickyStack  — scoped sticky-stack of the 3 진단 토픽 cards (cover/recede)
 *   - useLineDraw     — strokeDashoffset scrub-draw of the 전국 10년 추이 line chart
 *   - useCountUp      — count-up on number slides (stats / targets)
 *   - useGhostParallax— giant ghosted numeral / glyph drift behind a slide
 *   - useBarGrow      — bar-chart fills grow from 0 as they enter view
 * All gate behind prefers-reduced-motion and clean up via gsap.context().revert().
 */

function reduced(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Scoped sticky-stack (like /stacktest, but scoped to one wrapper so the rest of
 * the page stays normal flow). Each `.tm-stack__card` inside `rootRef` is sticky;
 * the NEXT card scrolls up to cover the previous, which dims + shrinks as it
 * recedes (monotonic bright → dark, never the reverse).
 */
export function useStickyStack(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (reduced() || !rootRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".tm-stack__card");
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return; // last card never recedes
        gsap.fromTo(
          card,
          { filter: "brightness(1)", scale: 1 },
          {
            filter: "brightness(0.5)",
            scale: 0.965,
            ease: "none",
            scrollTrigger: {
              trigger: cards[i + 1],
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          }
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, [rootRef]);
}

/**
 * Signature data moment: draw each `[data-line]` path by scrubbing its
 * strokeDashoffset from full length → 0 as the chart scrolls through view. Dots
 * and labels (`[data-line-mark]`) fade in alongside the draw.
 */
export function useLineDraw(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (reduced() || !rootRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const paths = gsap.utils.toArray<SVGPathElement>("[data-line]");
      paths.forEach((path, i) => {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 75%",
            end: "bottom 65%",
            scrub: 1,
          },
          delay: i * 0.05,
        });
      });
      gsap.from("[data-line-mark]", {
        autoAlpha: 0,
        duration: 0.5,
        stagger: 0.08,
        scrollTrigger: { trigger: rootRef.current, start: "top 60%" },
      });
    }, rootRef);
    return () => ctx.revert();
  }, [rootRef]);
}

/**
 * Count every `[data-count]` from 0 → its numeric target as it enters view.
 * Honours data-decimals / data-prefix / data-suffix. Under reduced-motion the
 * final value is written immediately (no animation).
 */
export function useCountUp(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!rootRef.current) return;
    const els = Array.from(
      rootRef.current.querySelectorAll<HTMLElement>("[data-count]")
    );
    const fmt = (el: HTMLElement, v: number) => {
      const dec = Number(el.dataset.decimals ?? "0");
      const prefix = el.dataset.prefix ?? "";
      const suffix = el.dataset.suffix ?? "";
      const n =
        dec > 0 ? v.toFixed(dec) : Math.round(v).toLocaleString("en-US");
      el.textContent = `${prefix}${n}${suffix}`;
    };
    if (reduced()) {
      els.forEach((el) => fmt(el, Number(el.dataset.count ?? "0")));
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      els.forEach((el) => {
        const target = Number(el.dataset.count ?? "0");
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
          onUpdate: () => fmt(el, obj.v),
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, [rootRef]);
}

/** Drift each `[data-ghost]` vertically as the page scrolls (parallax). */
export function useGhostParallax(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (reduced() || !rootRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const ghosts = gsap.utils.toArray<HTMLElement>("[data-ghost]");
      ghosts.forEach((g) => {
        const dist = Number(g.dataset.ghostShift ?? "120");
        gsap.fromTo(
          g,
          { yPercent: -dist / 10 },
          {
            yPercent: dist / 10,
            ease: "none",
            scrollTrigger: {
              trigger: g.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, [rootRef]);
}

/** Grow each `[data-bar]` fill from scaleX 0 → 1 as it enters view (data-viz). */
export function useBarGrow(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (reduced() || !rootRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const bars = gsap.utils.toArray<HTMLElement>("[data-bar]");
      gsap.from(bars, {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
      });
    }, rootRef);
    return () => ctx.revert();
  }, [rootRef]);
}

"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Sticky-stack scroll for the FINAL variants (hut8.com style), tuned per user feedback:
 *
 *  1. SCROLL-LOCK / SNAP — pure sticky scrolling felt "too sensitive"; it was hard to
 *     land on exactly one slide. We add a ScrollTrigger snap so the scroll settles
 *     precisely onto one card (a short dwell, then it advances). Native scroll is used
 *     (no Lenis) so the snap stays crisp and doesn't fight a smooth-scroll rAF loop.
 *
 *  2. COVER DIM DIRECTION — the OUTGOING (upper) card goes from its ORIGINAL brightness
 *     DOWN to dark as the next card slides up to cover it (monotonic bright → dark),
 *     never dark → bright. The incoming card always stays at full brightness.
 *
 * Pass a ref to the scroll root (the element containing all `.stack-card`s). Respects
 * prefers-reduced-motion (no dim, no snap — plain scrolling).
 */
export function useStackScroll(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".stack-card");

      // (2) Cover dim — outgoing card: original brightness → dark, as next covers it.
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return; // last card never recedes
        gsap.fromTo(
          card,
          { filter: "brightness(1)", scale: 1 },
          {
            filter: "brightness(0.42)",
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

      // (1) Scroll-lock — snap to exactly one slide with a brief dwell before advancing.
      if (cards.length > 1 && rootRef.current) {
        ScrollTrigger.create({
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          snap: {
            snapTo: 1 / (cards.length - 1),
            // Longer dwell/lock per feedback: waits a beat after you stop, then
            // eases more slowly onto the slide so each panel "locks" longer.
            duration: { min: 0.45, max: 1.0 },
            delay: 0.18,
            ease: "power2.inOut",
          },
        });
      }
    }, rootRef);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const id = window.setTimeout(refresh, 300);

    return () => {
      window.clearTimeout(id);
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, [rootRef]);
}

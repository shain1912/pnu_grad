"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Smooth scroll + ScrollTrigger for the FINAL (sticky-stack) variants.
 *
 * Unlike `useLenis`, this does NOT enable the CSS scroll-snap deck — the final
 * variants use the sticky-stack ("each section pins and the next covers it",
 * hut8.com style) which is its own mechanism (see src/app/stacktest/Stack.tsx).
 * Lenis provides the smooth glide; the per-page cover (scale/dim of the outgoing
 * card) is set up by each variant against its own `.stack-card` elements.
 *
 * Registers ScrollTrigger, drives Lenis from the GSAP ticker, refreshes once
 * layout settles, and tears everything down on unmount. Respects
 * prefers-reduced-motion (skips Lenis; variants gate their GSAP too).
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      prevent: (node) => node.tagName === "IFRAME",
    });

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const refreshId = window.setTimeout(refresh, 300);

    return () => {
      window.clearTimeout(refreshId);
      window.removeEventListener("load", refresh);
      lenis.destroy();
      gsap.ticker.remove(update);
    };
  }, []);
}

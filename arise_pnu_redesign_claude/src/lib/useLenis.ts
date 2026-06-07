"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Initializes Lenis smooth scrolling, wires it to GSAP's ScrollTrigger, and
 * enables the shared full-screen "snap deck" experience used by every variant:
 * a `snap-deck` class is added to <html> so each `.snap-panel` section locks to
 * the viewport (CSS scroll-snap, see globals.css). Lenis is told to refresh
 * ScrollTrigger and keep snap-points accurate after layout/pin changes.
 *
 * Call once near the top of a variant's client root. Tears everything down on
 * unmount so route changes never leave dangling rAF loops or the snap class.
 *
 * Respects prefers-reduced-motion: smooth scroll AND snapping are both skipped
 * (the reduced-motion CSS turns snap off), so the page degrades to plain native
 * scrolling. Variants should also gate their GSAP setup.
 */
export function useLenis() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Enable the full-screen snap deck (CSS handles the reduced-motion opt-out).
    const root = document.documentElement;
    root.classList.add("snap-deck");

    if (prefersReduced) {
      return () => root.classList.remove("snap-deck");
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      prevent: (node) => node.tagName === "IFRAME",
    });

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Keep snap points correct once pinned sections add their spacers.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const refreshId = window.setTimeout(refresh, 300);

    return () => {
      window.clearTimeout(refreshId);
      window.removeEventListener("load", refresh);
      lenis.destroy();
      gsap.ticker.remove(update);
      root.classList.remove("snap-deck");
    };
  }, []);
}

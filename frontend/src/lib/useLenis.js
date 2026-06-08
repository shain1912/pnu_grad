import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Initializes Lenis smooth scrolling, wires it to GSAP's ScrollTrigger, and
 * enables the shared full-screen "snap deck" experience.
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

    const update = (time) => lenis.raf(time * 1000);
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

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Smooth scroll + ScrollTrigger for the FINAL (sticky-stack) variants.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    // 라우트 진입(홈/대학원 육성/구심점 확립/AURA 등) 시 항상 최상단부터 보이도록.
    // SPA 는 라우트 전환 시 스크롤 위치를 유지하므로 명시적으로 0 으로 리셋한다.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      prevent: (node) => node.tagName === "IFRAME",
    });

    // Lenis 는 init 시 현재 스크롤 값을 읽으므로, 새 페이지 진입 직후 즉시 최상단 고정.
    lenis.scrollTo(0, { immediate: true, force: true });

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time) => lenis.raf(time * 1000);
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

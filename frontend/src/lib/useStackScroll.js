import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Sticky-stack scroll for the FINAL variants (hut8.com style).
 */
export function useStackScroll(rootRef) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".stack-card");

      // Cover dim — outgoing card: original brightness → dark, as next covers it.
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

      // Scroll-lock — snap to exactly one slide with a brief dwell before advancing.
      if (cards.length > 1 && rootRef.current) {
        ScrollTrigger.create({
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          snap: {
            snapTo: 1 / (cards.length - 1),
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

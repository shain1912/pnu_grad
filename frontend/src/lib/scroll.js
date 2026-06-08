import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Scroll-behavior toolkit for the multi-page variants.
 */

function reduced() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Fade/stagger every [data-reveal] descendant in as it enters the viewport. */
export function useReveal(rootRef) {
  useEffect(() => {
    if (reduced() || !rootRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray("[data-reveal]");
      items.forEach((el) => {
        gsap.from(el, {
          y: 28,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, [rootRef]);
}

/**
 * Pin `wrapRef` and translate `trackRef` horizontally (right → left) across the
 * pinned span.
 */
export function useHorizontalPan(wrapRef, trackRef) {
  useEffect(() => {
    if (reduced() || !wrapRef.current || !trackRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const distance = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, wrapRef);
    return () => ctx.revert();
  }, [wrapRef, trackRef]);
}

/** Pin a section for `extra` viewport-heights while its inner content animates. */
export function usePin(sectionRef, extra = 0.6) {
  useEffect(() => {
    if (reduced() || !sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${window.innerHeight * extra}`,
        pin: true,
        pinSpacing: true,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [sectionRef, extra]);
}

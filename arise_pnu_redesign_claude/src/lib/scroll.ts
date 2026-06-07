"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Scroll-behavior toolkit for the multi-page variants. The single uniform
 * sticky-stack was monotonous; pages should mix mechanics:
 *   - useReveal       — light entrance fade/stagger (default for most sections)
 *   - useHorizontalPan— pin a section, pan a wide track right→left (for content
 *                       that would otherwise overflow/clip a slide)
 *   - usePin          — pin a section for a beat while inner content animates
 * Split "left fixed / right scrolls" needs no JS — use CSS `position: sticky`
 * on the left column inside a tall two-column section.
 *
 * All hooks are no-ops under prefers-reduced-motion and clean up on unmount.
 */

function reduced(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Fade/stagger every [data-reveal] descendant in as it enters the viewport. */
export function useReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (reduced() || !rootRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
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
 * pinned span. Use for one content-heavy section per page so nothing gets clipped
 * by the next slide. The track should be wider than the viewport (flex row).
 */
export function useHorizontalPan(
  wrapRef: RefObject<HTMLElement | null>,
  trackRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (reduced() || !wrapRef.current || !trackRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const track = trackRef.current!;
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
export function usePin(
  sectionRef: RefObject<HTMLElement | null>,
  extra = 0.6
) {
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

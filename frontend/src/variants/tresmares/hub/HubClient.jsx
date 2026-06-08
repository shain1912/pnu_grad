"use client";

import Shell from "../sections/Shell";
import HubSlides from "../sections/HubSlides";

/**
 * P3 구심점 확립 [HOW] — 5 light one-idea slides (개요 · AI대학 ADP+X · 거버넌스 ·
 * 인프라 · 18개 융합전공). Visual + GSAP layer matches /grad (diagrams · count-up ·
 * atmosphere + light reveals). See HubSlides.tsx.
 */
export default function HubClient() {
  return (
    <Shell>
      <HubSlides />
    </Shell>
  );
}

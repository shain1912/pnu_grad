"use client";

import Shell from "../sections/Shell";
import GradSlides from "../sections/GradSlides";

/**
 * P2 대학원 육성 [WHY] — re-split into many LIGHT slides (one idea per slide,
 * each ≈ one viewport). No dense multi-panel pan; clean reveal-per-slide flow.
 */
export default function GradClient() {
  return (
    <Shell>
      <GradSlides />
    </Shell>
  );
}

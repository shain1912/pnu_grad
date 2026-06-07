import type { Metadata } from "next";
import Shell from "../Shell";
import GradReality from "../sections/GradReality";
import GradCompare from "../sections/GradCompare";
import GradPlan from "../sections/GradPlan";

export const metadata: Metadata = {
  title: "대학원 육성 [WHY] — ARISE PNU | bymonolog",
  description:
    "한국 고등교육의 구조적 공백 — 현실, 거점국립대 비교, 부산대 대학원 발전계획(PNU 1000 AX).",
};

/**
 * P2 대학원 육성 [WHY] — 9 LIGHT one-idea slides (one viewport each) + a visual
 * layer (data-viz · diagram · 분위기) with GSAP used 적재적소·가끔:
 *   1 현실 인트로(count-up + blueprint grid + icon)
 *   2-4 진단 1.1/1.2/1.3 — SCOPED STICKY-STACK [special beat] + ghost numeral
 *       parallax; 1.3 = goldwash pop carrying the OECD bar chart (count-up).      (GradReality)
 *   5 거점국립대 1위 + bars(count-up) · 6 전국 10년 추이 — SVG LINE-CHART drawn via
 *       strokeDashoffset SCRUB [special beat / signature].                        (GradCompare)
 *   7 발전계획 목표·현황(count-up + ghost glyph) · 8 A Top-Down + PNU 1000 AX
 *       ecosystem FLOW diagram · 9 B Bottom-Up 3-step STEPPER diagram.            (GradPlan)
 * Most slides keep light useReveal; only the sticky-stack + line-draw are special
 * GSAP beats. All motion gated behind prefers-reduced-motion.
 */
export default function Page() {
  return (
    <Shell>
      <GradReality />
      <GradCompare />
      <GradPlan />
    </Shell>
  );
}

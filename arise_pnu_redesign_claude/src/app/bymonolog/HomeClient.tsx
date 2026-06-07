"use client";

import Shell from "./Shell";
import Hero from "./sections/Hero";
import VisionSummary from "./sections/VisionSummary";
import Metrics from "./sections/Metrics";
import TwoAxis from "./sections/TwoAxis";

/** P1 홈 — Hero · 비전체계도 요약 · 대표 KPI · 2축 진입 (짧게). */
export default function HomeClient() {
  return (
    <Shell>
      <Hero />
      <VisionSummary />
      <Metrics />
      <TwoAxis />
    </Shell>
  );
}

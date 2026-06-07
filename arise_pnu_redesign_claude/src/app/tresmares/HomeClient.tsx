"use client";

import Shell from "./sections/Shell";
import Hero from "./sections/Hero";
import VisionSummary from "./sections/VisionSummary";
import Metrics from "./sections/Metrics";
import HomeAxis from "./sections/HomeAxis";

/** P1 홈 — Hero · 비전체계도 요약 · 대표 KPI · 2축 진입. Short, light reveals. */
export default function HomeClient() {
  return (
    <Shell>
      <Hero />
      <VisionSummary />
      <Metrics />
      <HomeAxis />
    </Shell>
  );
}

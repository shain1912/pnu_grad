import type { Metadata } from "next";
import GradClient from "./GradClient";

export const metadata: Metadata = {
  title: "ARISE PNU · Light — 대학원 육성 (WHY)",
  description:
    "한국 고등교육의 구조적 공백과 동남권 격차, 거점국립대 비교, 그리고 부산대 대학원 발전계획(PNU 1000 AX).",
};

export default function Page() {
  return <GradClient />;
}

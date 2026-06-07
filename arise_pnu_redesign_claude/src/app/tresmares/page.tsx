import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "ARISE PNU · Light — 홈",
  description:
    "부산대학교 AI 거점대학육성사업단(ARISE PNU). 대학원 육성(WHY)에서 동남권 AI 구심점 확립(HOW)으로 — 라이트 에디토리얼 시안.",
};

export default function Page() {
  return <HomeClient />;
}

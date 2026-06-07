import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "ARISE PNU — 같이 더 높게 | bymonolog",
  description:
    "부산대학교 AI 거점대학육성사업단(ARISE PNU) — 대학원 육성(WHY)에서 동남권 AI 구심점 확립(HOW)으로. 시네마틱 다크 렌디션.",
};

export default function Page() {
  return <HomeClient />;
}

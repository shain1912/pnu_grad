import type { Metadata } from "next";
import Stack from "./Stack";

export const metadata: Metadata = {
  title: "Sticky Stack — 효과 테스트",
  description: "스티키 스택(오버랩 커버) 스크롤 효과 테스트 — hut8.com 스타일.",
};

export default function StackTestPage() {
  return <Stack />;
}

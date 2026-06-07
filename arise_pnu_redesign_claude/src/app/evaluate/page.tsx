import type { Metadata } from "next";
import Evaluate from "./Evaluate";

export const metadata: Metadata = {
  title: "시안 평가 — ARISE PNU",
  description: "5개 디자인 시안을 간단히 평가하고 통합 결정을 정리하는 페이지.",
};

export default function EvaluatePage() {
  return <Evaluate />;
}

import type { Metadata } from "next";
import AuraClient from "./AuraClient";

export const metadata: Metadata = {
  title: "ARISE PNU · Light — A.U.R.A. 2.0 ★",
  description:
    "PNU AX 마스터플랜 A.U.R.A. 2.0 — 비전체계도 4단, 8/22/47 규모, 4대 추진 축, 성과·서비스·3개년 로드맵.",
};

export default function Page() {
  return <AuraClient />;
}

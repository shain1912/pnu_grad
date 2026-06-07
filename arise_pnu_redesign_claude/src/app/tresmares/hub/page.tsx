import type { Metadata } from "next";
import HubClient from "./HubClient";

export const metadata: Metadata = {
  title: "ARISE PNU · Light — 구심점 확립 (HOW)",
  description:
    "조직(AI대학 ADP+X)·거버넌스(총장 직속 4기구)·인프라(PNU-AXIS GPU 허브)로 동남권 AI 구심점을 확립합니다.",
};

export default function Page() {
  return <HubClient />;
}

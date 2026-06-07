import type { Metadata } from "next";
import Shell from "../Shell";
import HubOverview from "../sections/HubOverview";
import HubOrg from "../sections/HubOrg";
import Majors from "../sections/Majors";
import HubGovernance from "../sections/HubGovernance";
import HubInfra from "../sections/HubInfra";

export const metadata: Metadata = {
  title: "구심점 확립 [HOW] — ARISE PNU | bymonolog",
  description:
    "조직(AI대학 ADP+X) · 거버넌스(총장 직속 4기구) · 인프라(PNU-AXIS GPU 허브)로 동남권 AI 구심점을 확립합니다.",
};

/**
 * P3 구심점 확립 [HOW] — 개요 · 학사조직(horizontal pan) · 거버넌스 · 인프라(sticky split).
 */
export default function Page() {
  return (
    <Shell>
      <div className="pt-20" />
      <HubOverview />
      <HubOrg />
      <Majors />
      <HubGovernance />
      <HubInfra />
    </Shell>
  );
}

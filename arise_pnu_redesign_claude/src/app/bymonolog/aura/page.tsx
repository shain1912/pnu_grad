import type { Metadata } from "next";
import Shell from "../Shell";
import Aura from "../sections/Aura";
import AuraSignature from "../sections/AuraSignature";
import Framework from "../sections/Framework";
import Achievements from "../sections/Achievements";
import Services from "../sections/Services";
import Roadmap from "../sections/Roadmap";

export const metadata: Metadata = {
  title: "A.U.R.A. — ARISE PNU | bymonolog",
  description:
    "PNU AX 마스터플랜 A.U.R.A. 2.0 — 비전체계도 4단, 8/22/47 규모, 4대 축, 성과·서비스·로드맵.",
};

/**
 * P4 ⭐ A.U.R.A. — the signature page. Carries the bymonolog signature motion
 * (A.U.R.A 워드마크 핀 분할 리빌) on the 8/22/47 reveal.
 */
export default function Page() {
  return (
    <Shell>
      <Aura />
      <AuraSignature />
      <Framework />
      <Achievements />
      <Services />
      <Roadmap />
    </Shell>
  );
}

"use client";

import Shell from "../sections/Shell";
import Aura from "../sections/Aura";
import AuraFramework from "../sections/AuraFramework";
import Achievements from "../sections/Achievements";
import Services from "../sections/Services";
import Roadmap from "../sections/Roadmap";

/**
 * P4 ⭐ A.U.R.A. — the signature page.
 *  1) vision diagram 4-tier + 8/22/47 scale (Aura)
 *  2) SIGNATURE: pinned-left-nav + SVG growth-line over the 4 axes (AuraFramework)
 *  3) 성과 (Achievements)  4) 서비스 (Services)  5) 로드맵 (Roadmap, growth line)
 */
export default function AuraClient() {
  return (
    <Shell>
      <Aura />
      <AuraFramework />
      <Achievements />
      <Services />
      <Roadmap />
    </Shell>
  );
}

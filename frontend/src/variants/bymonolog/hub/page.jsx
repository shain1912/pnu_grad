import Shell from "../Shell";
import HubOverview from "../sections/HubOverview";
import HubOrg from "../sections/HubOrg";
import Majors from "../sections/Majors";
import HubGovernance from "../sections/HubGovernance";
import HubInfra from "../sections/HubInfra";

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

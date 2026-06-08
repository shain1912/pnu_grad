import Shell from "../Shell";
import GradReality from "../sections/GradReality";
import GradCompare from "../sections/GradCompare";
import GradPlan from "../sections/GradPlan";

export default function Page() {
  return (
    <Shell>
      <GradReality />
      <GradCompare />
      <GradPlan />
    </Shell>
  );
}

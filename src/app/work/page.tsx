import { WorkGrid } from "@/components/public/WorkGrid";
import { fetchProjects } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const projects = await fetchProjects("en");
  const labels = {
    all: "All",
    index: "Index 01 · Selected Work",
    entries: "entries",
    title: "Work",
  };
  return <WorkGrid projects={projects} labels={labels} />;
}

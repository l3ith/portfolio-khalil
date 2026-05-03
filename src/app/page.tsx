import { HomeHero } from "@/components/public/HomeHero";
import { fetchProjects } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await fetchProjects("en");
  return <HomeHero projects={projects} />;
}

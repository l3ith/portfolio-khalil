import { HomeCarousel } from "@/components/public/HomeCarousel";
import { fetchProjects } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await fetchProjects("en");
  return <HomeCarousel projects={projects} />;
}

import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/public/ProjectDetail";
import { fetchProject, fetchProjects } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, allProjects] = await Promise.all([
    fetchProject(slug, "en"),
    fetchProjects("en"),
  ]);
  if (!project) notFound();
  return <ProjectDetail project={project} allProjects={allProjects} />;
}

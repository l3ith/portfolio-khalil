import { HomeCarousel } from "@/components/public/HomeCarousel";
import { fetchProjects } from "@/lib/queries";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [projects, setting] = await Promise.all([
    fetchProjects("en"),
    db.setting.findFirst({ select: { homeTitleSize: true, homeTitleAlign: true } }),
  ]);
  return (
    <HomeCarousel
      projects={projects}
      titleSize={setting?.homeTitleSize ?? 56}
      titleAlign={(setting?.homeTitleAlign as "left" | "center" | "right") ?? "center"}
    />
  );
}

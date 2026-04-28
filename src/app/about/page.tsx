import { AboutContent } from "@/components/public/AboutContent";
import { fetchAbout } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const { bio, timeline } = await fetchAbout("en");
  const labels = {
    profile: "Profile",
    bio: "Biography",
    trajectory: "Trajectory",
    commission: "Commission",
    welcome: "Studios, OEMs and producers\ncurrently welcome.",
    cta: "Open a Conversation",
    portrait: "Khalil · Studio Portrait",
    nameLine1: "Khalil",
    nameLine2: "— Designer.",
  };
  return <AboutContent bio={bio} timeline={timeline} labels={labels} />;
}

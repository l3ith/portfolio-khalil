import { AboutContent } from "@/components/public/AboutContent";
import { fetchAbout } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const { bio, timeline, portraitUrl, name, title } = await fetchAbout("en");
  const labels = {
    profile: "Profile",
    bio: "Biography",
    trajectory: "Trajectory",
    commission: "Commission",
    welcome: "Studios, OEMs and producers\ncurrently welcome.",
    cta: "Open a Conversation",
    portrait: `${name} · Studio Portrait`,
    nameLine1: name,
    nameLine2: title,
  };
  return <AboutContent bio={bio} timeline={timeline} labels={labels} portraitUrl={portraitUrl} />;
}

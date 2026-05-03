import Link from "next/link";
import { fetchProjects } from "@/lib/queries";
import { accentColor } from "@/lib/data";
import { Placeholder } from "@/components/Placeholder";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function AllProjectsPage() {
  const projects = await fetchProjects("en");

  return (
    <section
      data-screen-label="All Projects"
      data-header-theme="light"
      style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)", paddingTop: 64 }}
    >
      <div style={{ padding: "64px 24px 32px", borderBottom: "1px solid var(--rule)" }}>
        <div className="smallcaps" style={{ color: "var(--muted)", marginBottom: 16 }}>
          · All Projects · {String(projects.length).padStart(2, "0")} entries
        </div>
        <h1
          className="display"
          style={{ fontSize: "clamp(56px, 9vw, 168px)", margin: 0, fontWeight: 300 }}
        >
          All Projects
        </h1>
      </div>

      {projects.length === 0 ? (
        <div
          style={{
            padding: "120px 24px",
            textAlign: "center",
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          · No published projects yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {projects.map((p, idx) => (
            <Link
              key={p.id}
              href={`/work/${p.id}`}
              data-cursor="OPEN"
              style={{
                display: "block",
                borderBottom: "1px solid var(--rule)",
                color: "var(--fg)",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16/9",
                  overflow: "hidden",
                  background: "rgba(10,10,10,0.04)",
                }}
              >
                <Placeholder
                  label={p.title}
                  ratio="16/9"
                  tone="light"
                  variant="schematic"
                  accent={accentColor(p.accent)}
                  src={
                    p.thumbnailUrl ||
                    p.gallery[0]?.url ||
                    `https://picsum.photos/seed/${p.id}/1600/900?grayscale`
                  }
                  objectPosition={`${p.thumbnailX ?? 50}% ${p.thumbnailY ?? 50}%`}
                  style={{ position: "absolute", inset: 0, height: "100%" }}
                  showCorners={false}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 24,
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    color: "rgba(10,10,10,0.7)",
                    background: "rgba(244,243,239,0.86)",
                    padding: "3px 8px",
                  }}
                >
                  {p.code} / {String(idx + 1).padStart(2, "0")}
                </div>
              </div>
              <div
                style={{
                  padding: "24px 24px 28px",
                  borderTop: "1px solid var(--rule)",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "baseline",
                  gap: 16,
                }}
              >
                <div>
                  <div className="smallcaps" style={{ color: "var(--muted)", marginBottom: 8 }}>
                    {p.category} · {p.year} · {p.client}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
                      fontWeight: 300,
                      fontSize: "clamp(24px, 4vw, 56px)",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.05,
                      textTransform: "uppercase",
                    }}
                  >
                    {p.title}
                  </div>
                  {p.subtitle && (
                    <div
                      style={{
                        fontFamily: "var(--font-inter), Inter, sans-serif",
                        fontSize: 15,
                        color: "var(--muted)",
                        marginTop: 6,
                        fontWeight: 300,
                      }}
                    >
                      {p.subtitle}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                  }}
                >
                  ↗
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Footer />
    </section>
  );
}

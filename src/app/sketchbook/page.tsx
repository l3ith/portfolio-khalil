import { db } from "@/lib/db";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function SketchbookPage() {
  const items = await db.sketchbookItem.findMany({ orderBy: { order: "asc" } });
  return (
    <section
      data-screen-label="Sketchbook"
      data-header-theme="light"
      style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)", paddingTop: 64 }}
    >
      <div style={{ padding: "64px 24px 32px", borderBottom: "1px solid var(--rule)" }}>
        <div className="smallcaps" style={{ color: "var(--muted)", marginBottom: 16 }}>
          · Sketchbook · {String(items.length).padStart(2, "0")} entries
        </div>
        <h1
          className="display"
          style={{ fontSize: "clamp(56px, 9vw, 168px)", margin: 0, fontWeight: 300 }}
        >
          Sketchbook
        </h1>
        <p
          style={{
            marginTop: 16,
            maxWidth: 640,
            fontFamily: "var(--font-inter)",
            fontSize: 16,
            color: "var(--muted)",
            fontWeight: 300,
            lineHeight: 1.5,
          }}
        >
          Standalone renders and isolated studies — outside the long-form projects.
        </p>
      </div>

      {items.length === 0 ? (
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
          · Empty — first entries coming soon.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(360px, 100%), 1fr))",
          }}
        >
          {items.map((it) => (
            <figure
              key={it.id}
              style={{
                margin: 0,
                borderRight: "1px solid var(--rule)",
                borderBottom: "1px solid var(--rule)",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: it.ratio,
                  background: "rgba(10,10,10,0.04)",
                  overflow: "hidden",
                }}
              >
                <img
                  src={it.imageUrl}
                  alt={it.titleEn}
                  loading="lazy"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: `${it.posX}% ${it.posY}%`,
                  }}
                />
              </div>
              {(it.titleEn || it.noteEn) && (
                <figcaption>
                  {it.titleEn && (
                    <div
                      style={{
                        fontFamily: "var(--font-space-grotesk)",
                        fontSize: 18,
                        fontWeight: 400,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {it.titleEn}
                    </div>
                  )}
                  {it.noteEn && (
                    <div
                      style={{
                        marginTop: 4,
                        fontFamily: "var(--font-inter)",
                        fontSize: 13,
                        color: "var(--muted)",
                        fontWeight: 300,
                      }}
                    >
                      {it.noteEn}
                    </div>
                  )}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      <Footer />
    </section>
  );
}

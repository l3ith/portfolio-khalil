import Link from "next/link";
import { db } from "@/lib/db";
import { accentColor } from "@/lib/data";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function ProjectsExportPage() {
  const rows = await db.project.findMany({
    include: { category: true },
    orderBy: { order: "asc" },
  });

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .project-card { break-inside: avoid; page-break-inside: avoid; }
          .print-only { display: block !important; }
        }
        @page { size: A4; margin: 16mm; }
        .print-only { display: none; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 0 80px" }}>
        {/* Header — hidden on print */}
        <div
          className="no-print"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 40,
            borderBottom: "1px solid var(--rule)",
            paddingBottom: 24,
          }}
        >
          <div>
            <Link
              href="/admin/projects"
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              ← Back to Projects
            </Link>
            <h1
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 13,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                margin: "12px 0 4px",
              }}
            >
              · Projects Export
            </h1>
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 11,
                color: "var(--muted)",
              }}
            >
              {rows.length} projects · Click &quot;Save as PDF / Print&quot; → choose &quot;Save as PDF&quot; in the dialog
            </div>
          </div>
          <PrintButton />
        </div>

        {/* Print-only title */}
        <div
          className="print-only"
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#888",
            marginBottom: 24,
          }}
        >
          Portfolio · Projects · {new Date().toLocaleDateString("fr-FR")}
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 1,
            background: "var(--rule)",
            border: "1px solid var(--rule)",
          }}
        >
          {rows.map((p) => {
            const accent = accentColor(p.accent);
            const thumb = p.thumbnailUrl || p.renderUrl;
            return (
              <div
                key={p.id}
                className="project-card"
                style={{
                  background: "var(--bg)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    aspectRatio: "16/9",
                    background: thumb ? undefined : "#111",
                    overflow: "hidden",
                    position: "relative",
                    borderBottom: `2px solid ${accent}`,
                  }}
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt={p.titleEn}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: `${p.thumbnailX ?? 50}% ${p.thumbnailY ?? 50}%`,
                        display: "block",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "monospace",
                        fontSize: 11,
                        letterSpacing: "0.2em",
                        color: "#444",
                        textTransform: "uppercase",
                      }}
                    >
                      {p.code} · No image
                    </div>
                  )}
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      padding: "3px 8px",
                      background: p.published ? accent : "rgba(0,0,0,0.6)",
                      color: p.published ? "#0a0a0a" : "#888",
                      fontFamily: "monospace",
                      fontSize: 9,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                    }}
                  >
                    {p.published ? "Published" : "Draft"}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: "16px 20px 20px" }}>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "#888",
                      marginBottom: 6,
                    }}
                  >
                    {p.code} · {p.category.nameEn} · {p.year}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-space-grotesk), sans-serif",
                      fontWeight: 300,
                      fontSize: 18,
                      letterSpacing: "-0.01em",
                      textTransform: "uppercase",
                      lineHeight: 1.05,
                      marginBottom: 6,
                    }}
                  >
                    {p.titleEn}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: 12,
                      color: "var(--muted)",
                      fontWeight: 300,
                      marginBottom: 10,
                    }}
                  >
                    {p.subtitleEn}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      fontFamily: "monospace",
                      fontSize: 9,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#666",
                      borderTop: "1px solid var(--rule)",
                      paddingTop: 10,
                    }}
                  >
                    <span>Client: {p.client || "—"}</span>
                    <span>·</span>
                    <span>Role: {p.role || "—"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

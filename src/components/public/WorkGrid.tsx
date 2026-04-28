"use client";

import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/lib/data";
import { Placeholder } from "@/components/Placeholder";
import { Footer } from "@/components/Footer";

export function WorkGrid({
  projects,
  labels,
}: {
  projects: Project[];
  labels: { all: string; index: string; entries: string; title: string };
}) {
  const cats = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];
  const [filter, setFilter] = useState<string>("All");
  const filtered = projects.filter((p) => filter === "All" || p.category === filter);

  return (
    <section
      data-screen-label="02 Work"
      data-header-theme="light"
      style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)", paddingTop: 64 }}
    >
      <div
        style={{
          padding: "64px 24px 24px",
          borderBottom: "1px solid var(--rule)",
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) auto",
          gap: 24,
          alignItems: "end",
        }}
      >
        <div>
          <div className="smallcaps" style={{ color: "var(--muted)", marginBottom: 16 }}>
            · {labels.index} · {String(projects.length).padStart(2, "0")} {labels.entries}
          </div>
          <h1
            className="display"
            style={{ fontSize: "clamp(56px, 9vw, 168px)", margin: 0, fontWeight: 300 }}
          >
            {labels.title}
          </h1>
        </div>

        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              data-cursor={c.toUpperCase()}
              style={{
                padding: "8px 14px",
                border: `1px solid ${filter === c ? "var(--fg)" : "var(--rule)"}`,
                background: filter === c ? "var(--fg)" : "transparent",
                color: filter === c ? "var(--bg)" : "var(--fg)",
                fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                transition: "all 320ms",
              }}
            >
              {c === "All" ? labels.all : c}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(380px, 100%), 1fr))",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        {filtered.map((p) => (
          <ProjectCard key={p.id} project={p} total={projects.length} />
        ))}
      </div>

      <Footer />
    </section>
  );
}

function ProjectCard({ project, total }: { project: Project; total: number }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={`/work/${project.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-cursor="OPEN"
      style={{
        textAlign: "left",
        background: "transparent",
        color: "var(--fg)",
        padding: 24,
        borderRight: "1px solid var(--rule)",
        borderTop: "1px solid var(--rule)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        position: "relative",
      }}
    >
      <div style={{ overflow: "hidden", position: "relative", aspectRatio: "4/3" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: hover ? "scale(1.05)" : "scale(1)",
            transition: "transform 700ms ease-out",
          }}
        >
          <Placeholder
            label={project.title}
            ratio="4/3"
            tone="light"
            variant="schematic"
            accent={`oklch(0.78 0.17 ${project.accent})`}
            src={
              project.thumbnailUrl ||
              project.gallery[0]?.url ||
              `https://picsum.photos/seed/${project.id}/800/600?grayscale`
            }
            objectPosition={`${project.thumbnailX ?? 50}% ${project.thumbnailY ?? 50}%`}
            style={{ height: "100%" }}
            showCorners={true}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
            fontSize: 11,
            letterSpacing: "0.22em",
            color: "rgba(10,10,10,0.7)",
            background: "rgba(244,243,239,0.86)",
            padding: "3px 8px",
          }}
        >
          {project.code} / {String(total).padStart(2, "0")}
        </div>
      </div>

      <div>
        <div className="smallcaps" style={{ color: "var(--muted)", marginBottom: 8 }}>
          {project.category} · {project.year}
        </div>
        <div
          style={{
            fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
            fontWeight: 300,
            fontSize: 28,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            textTransform: "uppercase",
          }}
        >
          {project.title}
        </div>
        <div
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 14,
            color: "var(--muted)",
            marginTop: 6,
            fontWeight: 300,
          }}
        >
          {project.subtitle}
        </div>
      </div>
    </Link>
  );
}

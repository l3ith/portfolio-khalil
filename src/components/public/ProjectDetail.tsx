"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { accentColor, type Project } from "@/lib/data";
import { ProjectCarouselBlock } from "@/components/public/ProjectCarouselBlock";
import { Placeholder } from "@/components/Placeholder";
import { Footer } from "@/components/Footer";

export function ProjectDetail({
  project,
  allProjects,
}: {
  project: Project;
  allProjects: Project[];
}) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [project.id]);

  useEffect(() => {
    const accent = accentColor(project.accent);
    document.documentElement.style.setProperty("--project-accent", accent);
    return () => {
      document.documentElement.style.removeProperty("--project-accent");
    };
  }, [project]);

  const accent = accentColor(project.accent);

  return (
    <article
      data-screen-label={`03 Project · ${project.title}`}
      style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)" }}
    >
      <section
        data-header-theme="dark"
        style={{
          position: "relative",
          height: "100vh",
          minHeight: 600,
          overflow: "hidden",
          background: "var(--bg)",
          color: "var(--fg)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-10% 0 -10% 0",
            transform: `translate3d(0, ${scrollY * 0.4}px, 0)`,
            willChange: "transform",
          }}
        >
          <Placeholder
            label={project.renderLabel}
            ratio="auto"
            tone="dark"
            variant="schematic"
            accent={accent}
            src={
              project.thumbnailUrl ||
              project.renderUrl ||
              project.gallery[0]?.url ||
              `https://picsum.photos/seed/${project.id}-hero/1920/1080?grayscale`
            }
            objectPosition={
              project.thumbnailUrl
                ? `${project.thumbnailX ?? 50}% ${project.thumbnailY ?? 50}%`
                : undefined
            }
            style={{ width: "100%", height: "120vh" }}
            showCorners={false}
          />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.42)" }} />
        <div
          style={{
            position: "absolute",
            top: 88,
            left: 24,
            right: 24,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
            fontSize: 11,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "rgba(240,238,232,0.7)",
          }}
        >
          <span>· Project · {project.code} / {String(allProjects.length).padStart(2, "0")}</span>
          <span>{project.category} · {project.year}</span>
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "0 24px",
            textAlign: "center",
            color: "#f0eee8",
          }}
        >
          <div className="smallcaps" style={{ color: "rgba(240,238,232,0.75)", marginBottom: 24 }}>
            {project.client}
          </div>
          <h1
            className="display"
            style={{ fontSize: "clamp(48px, 9vw, 168px)", margin: 0, fontWeight: 300, maxWidth: 1400 }}
          >
            {project.title}
          </h1>
          <div
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontWeight: 300,
              fontSize: 18,
              marginTop: 20,
              opacity: 0.78,
              maxWidth: 720,
            }}
          >
            {project.subtitle}
          </div>
        </div>
      </section>

      <section
        data-header-theme="light"
        style={{ padding: "96px 24px", maxWidth: 1280, margin: "0 auto" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 1,
            background: "var(--rule)",
            border: "1px solid var(--rule)",
            marginBottom: 96,
          }}
        >
          {[
            ["Client", project.client],
            ["Year", project.year],
            ["Role", project.role],
            ["Category", project.category],
          ].filter(([, v]) => v).map(([k, v]) => (
            <div
              key={k}
              style={{
                background: "var(--bg)",
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div className="smallcaps" style={{ color: "var(--muted)" }}>{k}</div>
              <div
                style={{
                  fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
                  fontWeight: 300,
                  fontSize: 22,
                  letterSpacing: "-0.01em",
                  textTransform: "uppercase",
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "left" }}>
          <div
            className="smallcaps"
            style={{ color: "var(--muted)", marginBottom: 16, textAlign: "center" }}
          >
            Overview
          </div>
          <div
            className="body-text rich-content"
            style={{ fontSize: 19, color: "var(--fg)", margin: 0 }}
            dangerouslySetInnerHTML={{ __html: project.description || "" }}
          />
        </div>
      </section>

      {project.gallery.length > 0 || (project.sketchUrl || project.renderUrl) ? (
        <section style={{ padding: "96px 24px", maxWidth: 1440, margin: "0 auto" }}>
          {project.gallery.length > 0 && (
            <div
              className="smallcaps"
              style={{
                color: "var(--muted)",
                marginBottom: 32,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>· Gallery · {String(project.gallery.length).padStart(2, "0")} plates</span>
              <span>{project.title}</span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {(project.sketchUrl || project.renderUrl) && project.wipePosition === 0 && (
              <SketchRenderWipe project={project} accent={accent} inline />
            )}
            {project.carousels
              ?.filter((c) => c.position === 0)
              .map((c) => (
                <ProjectCarouselBlock
                  key={c.id}
                  title={c.title}
                  ratio={c.ratio}
                  images={c.images}
                  accent={accent}
                />
              ))}
            {project.gallery.map((g, i) => (
              <div key={i}>
                <Placeholder
                  label={g.label}
                  ratio={g.ratio}
                  tone="light"
                  variant="stripes"
                  accent={accent}
                  src={
                    g.url ||
                    `https://picsum.photos/seed/${project.id}-g${i + 1}/1600/900?grayscale`
                  }
                  objectPosition={`${g.posX ?? 50}% ${g.posY ?? 50}%`}
                  meta={`${project.code}.${String(i + 1).padStart(2, "0")}`}
                />
                {(project.sketchUrl || project.renderUrl) && project.wipePosition === i + 1 && (
                  <SketchRenderWipe project={project} accent={accent} inline />
                )}
                {project.carousels
                  ?.filter((c) => c.position === i + 1)
                  .map((c) => (
                    <ProjectCarouselBlock
                      key={c.id}
                      title={c.title}
                      ratio={c.ratio}
                      images={c.images}
                      accent={accent}
                    />
                  ))}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {project.credits.length > 0 && (
        <section
          style={{
            padding: "64px 24px 96px",
            maxWidth: 960,
            margin: "0 auto",
            borderTop: "1px solid var(--rule)",
          }}
        >
          <div className="smallcaps" style={{ color: "var(--muted)", marginBottom: 32 }}>· Credits</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "0 64px",
            }}
          >
            {project.credits.map(([role, name], i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  padding: "16px 0",
                  borderBottom: "1px solid var(--rule)",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 15,
                  fontWeight: 300,
                }}
              >
                <span style={{ color: "var(--muted)" }}>{role}</span>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <NextProject project={project} allProjects={allProjects} />

      <SuggestedProjects current={project} allProjects={allProjects} />

      <style>{`@media (max-width: 880px) { .suggested-grid { grid-template-columns: 1fr !important; } }`}</style>

      <Footer />
    </article>
  );
}

function SuggestedProjects({
  current,
  allProjects,
}: {
  current: Project;
  allProjects: Project[];
}) {
  if (allProjects.length < 2) return null;
  const idx = allProjects.findIndex((p) => p.id === current.id);
  const nextIdx = (idx + 1) % allProjects.length;
  const others = allProjects.filter((_, i) => i !== idx && i !== nextIdx).slice(0, 3);

  return (
    <section
      style={{
        padding: "96px 24px 64px",
        maxWidth: 1440,
        margin: "0 auto",
        borderTop: "1px solid var(--rule)",
      }}
    >
      <div
        className="smallcaps"
        style={{
          color: "var(--muted)",
          marginBottom: 32,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>· Suggested · More work</span>
        <span>{String(others.length).padStart(2, "0")} projects</span>
      </div>

      <div
        className="suggested-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
          background: "var(--rule)",
          border: "1px solid var(--rule)",
        }}
      >
        {others.map((p) => (
          <Link
            key={p.id}
            href={`/work/${p.id}`}
            data-cursor="OPEN"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              padding: 20,
              background: "var(--bg)",
              color: "var(--fg)",
            }}
          >
            <div style={{ aspectRatio: "4/3", overflow: "hidden" }}>
              <Placeholder
                label={p.title}
                ratio="4/3"
                tone="light"
                variant="schematic"
                accent={accentColor(p.accent)}
                src={
                  p.thumbnailUrl ||
                  p.renderUrl ||
                  p.gallery[0]?.url ||
                  `https://picsum.photos/seed/${p.id}/800/600?grayscale`
                }
                objectPosition={
                  p.thumbnailUrl
                    ? `${p.thumbnailX ?? 50}% ${p.thumbnailY ?? 50}%`
                    : undefined
                }
                style={{ height: "100%" }}
                showCorners={true}
              />
            </div>
            <div>
              <div className="smallcaps" style={{ color: "var(--muted)", marginBottom: 6 }}>
                {p.code} · {p.category} · {p.year}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
                  fontWeight: 300,
                  fontSize: 22,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.05,
                  textTransform: "uppercase",
                }}
              >
                {p.title}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 13,
                  color: "var(--muted)",
                  marginTop: 4,
                  fontWeight: 300,
                }}
              >
                {p.subtitle}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SketchRenderWipe({ project, accent, inline = false }: { project: Project; accent: string; inline?: boolean }) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

  const updatePos = (clientX: number) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePos(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    updatePos(e.clientX);
  };

  const inner = (
    <>
      <div
        className="smallcaps"
        style={{
          color: "var(--muted)",
          marginBottom: 18,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>· Sketch · Render</span>
        <span>Drag to compare</span>
      </div>

      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        style={{
          position: "relative",
          aspectRatio: "16/9",
          overflow: "hidden",
          background: "#0a0a0a",
          cursor: "ew-resize",
          userSelect: "none",
          border: "1px solid var(--rule)",
        }}
        data-cursor="DRAG"
      >
        <Placeholder
          label={project.renderLabel}
          ratio="16/9"
          tone="dark"
          variant="schematic"
          accent={accent}
          src={
            project.renderUrl ||
            `https://picsum.photos/seed/${project.id}-render/1600/900?grayscale`
          }
          style={{ position: "absolute", inset: 0 }}
          showCorners={false}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: `inset(0 ${100 - pos}% 0 0)`,
            background: project.sketchUrl
              ? `url(${project.sketchUrl}) center/cover no-repeat`
              : "#f4f3ef",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${pos}%`,
            width: 1,
            background: accent,
            transform: "translateX(-0.5px)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 44,
              height: 44,
              background: accent,
              color: "#0a0a0a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            ↔
          </div>
        </div>
      </div>
    </>
  );

  if (inline) return <div style={{ marginTop: 16 }}>{inner}</div>;

  return (
    <section
      data-header-theme="light"
      style={{ padding: "0 24px 96px", maxWidth: 1440, margin: "0 auto" }}
    >
      {inner}
    </section>
  );
}

function NextProject({ project, allProjects }: { project: Project; allProjects: Project[] }) {
  if (allProjects.length < 2) return null;
  const idx = allProjects.findIndex((p) => p.id === project.id);
  const next = allProjects[(idx + 1) % allProjects.length];

  return (
    <section
      data-header-theme="dark"
      style={{
        background: "var(--bg)",
        color: "var(--fg)",
        padding: "120px 24px",
        textAlign: "center",
        borderTop: "1px solid var(--rule)",
      }}
    >
      <div className="smallcaps" style={{ color: "var(--muted)", marginBottom: 18 }}>
        Next · {next.code} / {String(allProjects.length).padStart(2, "0")}
      </div>
      <Link href={`/work/${next.id}`} data-cursor="OPEN" style={{ color: "var(--fg)", display: "block" }}>
        <h2
          className="display"
          style={{ fontSize: "clamp(48px, 9vw, 160px)", margin: 0, fontWeight: 300 }}
        >
          {next.title}
        </h2>
      </Link>
      <div
        style={{
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: 16,
          marginTop: 16,
          opacity: 0.7,
          fontWeight: 300,
        }}
      >
        {next.subtitle}
      </div>
      <Link
        href="/work"
        data-cursor="ALL WORK"
        style={{
          marginTop: 48,
          display: "inline-block",
          color: "var(--muted)",
          fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
          fontSize: 11,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          padding: "10px 16px",
          border: "1px solid var(--rule)",
        }}
      >
        ← All Work
      </Link>
    </section>
  );
}

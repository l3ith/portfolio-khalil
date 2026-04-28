"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { accentColor, type Project } from "@/lib/data";
import { Placeholder } from "@/components/Placeholder";

type Align = "left" | "center" | "right";

export function HomeCarousel({
  projects,
  titleSize = 56,
  titleAlign = "center",
}: {
  projects: Project[];
  titleSize?: number;
  titleAlign?: Align;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hint, setHint] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = projects.length;
  const next = () => setActive((a) => (a + 1) % total);
  const prev = () => setActive((a) => (a - 1 + total) % total);

  useEffect(() => {
    if (paused || total === 0) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % total), 7000);
    return () => clearTimeout(id);
  }, [active, paused, hint, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        next();
        setHint((h) => h + 1);
      }
      if (e.key === "ArrowLeft") {
        prev();
        setHint((h) => h + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  if (total === 0) return null;
  const project = projects[active];

  return (
    <section
      data-screen-label="01 Home"
      data-header-theme="dark"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--fg)",
        overflow: "hidden",
        paddingTop: 64,
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <HudFrame active={active} total={total} project={project} />

      <div
        ref={containerRef}
        style={{
          height: "calc(100vh - 64px)",
          minHeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: 1800,
          position: "relative",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "70%", maxHeight: 720 }}>
          {projects.map((p, i) => {
            let o = i - active;
            if (o > total / 2) o -= total;
            if (o < -total / 2) o += total;

            const isCenter = o === 0;
            const isVisible = Math.abs(o) <= 2;
            if (!isVisible) return null;

            const sign = Math.sign(o);
            const abs = Math.abs(o);
            const translateX = sign * (38 + (abs - 1) * 18);
            const rotateY = -sign * 22 * Math.min(abs, 1) - sign * 6 * Math.max(abs - 1, 0);
            const scale = isCenter ? 1 : 0.78 - (abs - 1) * 0.08;
            const opacity = isCenter ? 1 : abs === 1 ? 0.55 : 0.18;
            const z = 10 - abs;

            return (
              <button
                key={p.id}
                onClick={() => {
                  if (isCenter) window.location.href = `/work/${p.id}`;
                  else {
                    setActive(i);
                    setHint((h) => h + 1);
                  }
                }}
                data-cursor={isCenter ? "OPEN PROJECT" : "FOCUS"}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: "50%",
                  width: "min(78vw, 1200px)",
                  transform: `translate(-50%, 0) translateX(${translateX}%) rotateY(${rotateY}deg) scale(${scale})`,
                  transformStyle: "preserve-3d",
                  transition:
                    "transform 900ms cubic-bezier(0.7,0,0.15,1), opacity 700ms cubic-bezier(0.4,0,0.15,1)",
                  opacity,
                  zIndex: z,
                  background: "transparent",
                  padding: 0,
                  cursor: "pointer",
                  border: 0,
                  display: "block",
                }}
              >
                <SlideArt project={p} active={isCenter} />
              </button>
            );
          })}
        </div>
      </div>

      <BottomBar
        active={active}
        total={total}
        project={project}
        titleSize={titleSize}
        titleAlign={titleAlign}
        onPrev={() => {
          prev();
          setHint((h) => h + 1);
        }}
        onNext={() => {
          next();
          setHint((h) => h + 1);
        }}
        onSelect={(i) => {
          setActive(i);
          setHint((h) => h + 1);
        }}
      />
    </section>
  );
}

function SlideArt({ project, active }: { project: Project; active: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "var(--bg)",
        border: "1px solid var(--rule)",
        overflow: "hidden",
      }}
    >
      <Placeholder
        label={project.renderLabel}
        ratio="auto"
        tone="dark"
        variant="schematic"
        accent={accentColor(project.accent)}
        src={
          project.thumbnailUrl ||
          project.renderUrl ||
          project.gallery[0]?.url ||
          `https://picsum.photos/seed/${project.id}/1600/900?grayscale`
        }
        objectPosition={
          project.thumbnailUrl
            ? `${project.thumbnailX ?? 50}% ${project.thumbnailY ?? 50}%`
            : undefined
        }
        style={{ width: "100%", height: "100%" }}
        showCorners={false}
      />
      <div
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
          fontSize: 11,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "rgba(240,238,232,0.8)",
          padding: "5px 10px",
          border: "1px solid rgba(240,238,232,0.3)",
        }}
      >
        {project.category} / {project.year}
      </div>
      {active && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <Reticle accent={accentColor(project.accent)} />
          {/* Reticle still uses accentColor */}
        </div>
      )}
    </div>
  );
}

function Reticle({ accent }: { accent: string }) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" style={{ opacity: 0.7 }}>
      <circle cx="60" cy="60" r="40" stroke={accent} strokeWidth="0.75" fill="none" />
      <circle cx="60" cy="60" r="2" fill={accent} />
      <line x1="60" y1="0" x2="60" y2="14" stroke={accent} strokeWidth="0.75" />
      <line x1="60" y1="106" x2="60" y2="120" stroke={accent} strokeWidth="0.75" />
      <line x1="0" y1="60" x2="14" y2="60" stroke={accent} strokeWidth="0.75" />
      <line x1="106" y1="60" x2="120" y2="60" stroke={accent} strokeWidth="0.75" />
      <text
        x="68"
        y="56"
        fill={accent}
        style={{
          fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
          fontSize: 7,
          letterSpacing: "0.2em",
        }}
      >
        TGT · LOCK
      </text>
    </svg>
  );
}

function HudFrame({
  active,
  total,
  project,
}: {
  active: number;
  total: number;
  project: Project;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        left: 24,
        right: 24,
        display: "flex",
        justifyContent: "space-between",
        zIndex: 5,
        pointerEvents: "none",
        fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
        fontSize: 11,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        color: "rgba(240,238,232,0.6)",
      }}
    >
      <span>· Featured Work · {String(total).padStart(2, "0")} Selected</span>
      <span>
        {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} ·{" "}
        {project.category}
      </span>
    </div>
  );
}

function BottomBar({
  active,
  total,
  project,
  titleSize,
  titleAlign,
  onPrev,
  onNext,
  onSelect,
}: {
  active: number;
  total: number;
  project: Project;
  titleSize: number;
  titleAlign: Align;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (i: number) => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "32px 24px 36px",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gap: 24,
        alignItems: "end",
        color: "var(--fg)",
        borderTop: "1px solid rgba(240,238,232,0.12)",
      }}
    >
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <button
          onClick={onPrev}
          data-cursor="PREV"
          aria-label="Previous"
          style={{
            width: 56,
            height: 56,
            border: "1px solid rgba(240,238,232,0.3)",
            color: "var(--fg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 320ms",
          }}
        >
          <Arrow dir="left" />
        </button>
        <button
          onClick={onNext}
          data-cursor="NEXT"
          aria-label="Next"
          style={{
            width: 56,
            height: 56,
            border: "1px solid rgba(240,238,232,0.3)",
            color: "var(--fg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Arrow dir="right" />
        </button>

        <div style={{ display: "flex", gap: 6, marginLeft: 12 }}>
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              aria-label={`Slide ${i + 1}`}
              data-cursor={String(i + 1).padStart(2, "0")}
              style={{
                width: i === active ? 28 : 8,
                height: 2,
                background: i === active ? "var(--accent)" : "rgba(240,238,232,0.25)",
                transition: "width 400ms cubic-bezier(0.4,0,0.15,1), background 400ms",
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ textAlign: titleAlign, maxWidth: 760, justifySelf: titleAlign === "left" ? "start" : titleAlign === "right" ? "end" : "center" }}>
        <div className="smallcaps" style={{ color: "rgba(240,238,232,0.55)", marginBottom: 10 }}>
          {project.category} · {project.year} · {project.client}
        </div>
        <h1
          className="display"
          style={{
            fontSize: `clamp(${Math.max(16, Math.round(titleSize * 0.5))}px, ${(titleSize / 16).toFixed(2)}vw, ${titleSize}px)`,
            fontWeight: 300,
            margin: 0,
            lineHeight: 1.05,
            color: accentColor(project.accent),
            transition: "color 600ms cubic-bezier(0.4,0,0.15,1)",
          }}
        >
          {project.title}
        </h1>
        <div
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 13,
            opacity: 0.7,
            marginTop: 8,
            fontWeight: 300,
          }}
        >
          {project.subtitle}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
        <Link
          href={`/work/${project.id}`}
          data-cursor="OPEN"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            padding: "16px 22px",
            border: "1px solid var(--fg)",
            color: "var(--fg)",
            fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
            fontSize: 12,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            transition: "background 320ms, color 320ms",
          }}
        >
          View Project <Arrow dir="right" small />
        </Link>
      </div>
    </div>
  );
}

function Arrow({ dir = "right", small = false }: { dir?: "left" | "right"; small?: boolean }) {
  const s = small ? 14 : 18;
  const rotate = dir === "left" ? 180 : 0;
  return (
    <svg width={s} height={s} viewBox="0 0 18 18" style={{ transform: `rotate(${rotate}deg)` }}>
      <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1" />
      <polyline points="11,4 16,9 11,14" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
}

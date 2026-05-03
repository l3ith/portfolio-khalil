"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { accentColor, type Project } from "@/lib/data";
import { Placeholder } from "@/components/Placeholder";

const MENU_ITEMS = [
  { href: "/", label: "Index", num: "00" },
  { href: "/work", label: "Work", num: "01" },
  { href: "/sketchbook", label: "Sketchbook", num: "02" },
  { href: "/about", label: "About", num: "03" },
  { href: "/contact", label: "Contact", num: "04" },
];

export function HomeHero({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paused, setPaused] = useState(false);

  const total = projects.length;
  const next = () => setActive((a) => (a + 1) % total);
  const prev = () => setActive((a) => (a - 1 + total) % total);

  useEffect(() => {
    if (paused || total === 0) return;
    const id = setTimeout(next, 6000);
    return () => clearTimeout(id);
  }, [active, paused, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  if (total === 0) return null;

  const project = projects[active];
  const categories = [...new Set(projects.map((p) => p.category).filter(Boolean))];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      {/* ── BLACK LEFT SIDEBAR ── */}
      <aside
        style={{
          width: 68,
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 0",
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.55)",
            fontSize: 13,
          }}
        >
          ✳
        </div>

        <span
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
            fontSize: 9,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.28)",
          }}
        >
          PORTFOLIO · 2026
        </span>

        <Link
          href="/about"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.45)",
            fontSize: 10,
            fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
            letterSpacing: "0.05em",
          }}
        >
          K
        </Link>
      </aside>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minWidth: 0 }}>

        {/* LEFT CONTENT PANEL */}
        <div
          style={{
            width: "42%",
            minWidth: 300,
            maxWidth: 520,
            background: "var(--bg)",
            display: "flex",
            flexDirection: "column",
            padding: "28px 32px 28px 36px",
            borderRight: "1px solid var(--rule)",
            overflowY: "auto",
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* FEATURED CARD */}
          <div
            style={{
              background: "#0f0f0f",
              borderRadius: 10,
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "88px 1fr",
              marginBottom: 24,
              flexShrink: 0,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                width: 88,
                height: 88,
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
                background: "#1a1a1a",
              }}
            >
              {(project.thumbnailUrl || project.gallery?.[0]?.url) ? (
                <img
                  src={project.thumbnailUrl || project.gallery[0]?.url || ""}
                  alt={project.title}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: project.thumbnailUrl
                      ? `${project.thumbnailX ?? 50}% ${project.thumbnailY ?? 50}%`
                      : "center",
                  }}
                />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    color: "rgba(240,238,232,0.25)",
                    fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
                    letterSpacing: "0.2em",
                  }}
                >
                  IMG
                </div>
              )}
            </div>
            <div
              style={{
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  lineHeight: 1.55,
                  color: "rgba(240,238,232,0.6)",
                  margin: 0,
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontWeight: 300,
                }}
              >
                {project.subtitle || project.title}
              </p>
              <Link
                href={`/work/${project.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
                  color: "rgba(240,238,232,0.75)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  padding: "5px 11px",
                  borderRadius: 999,
                  width: "fit-content",
                }}
              >
                EXPLORE MORE <span style={{ letterSpacing: 0 }}>›</span>
              </Link>
            </div>
          </div>

          {/* TIMELINE */}
          <div style={{ marginBottom: 22, flexShrink: 0, paddingLeft: 14 }}>
            {Array.from({ length: Math.min(3, total) }).map((_, i) => {
              const idx = (active + i) % total;
              const p = projects[idx];
              const isCurrent = idx === active;
              return (
                <button
                  key={p.id}
                  onClick={() => setActive(idx)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    padding: "9px 0",
                    borderBottom: "1px solid var(--rule)",
                    width: "100%",
                    textAlign: "left",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: -14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: isCurrent ? "var(--accent)" : "var(--rule)",
                      transition: "background 400ms",
                    }}
                  />
                  <span
                    className="mono"
                    style={{ fontSize: 10, color: "var(--muted)", flexShrink: 0, paddingTop: 1 }}
                  >
                    {String(total - i).padStart(2, "0")}
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: isCurrent ? 600 : 400,
                        color: isCurrent ? "var(--fg)" : "var(--muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        lineHeight: 1.3,
                      }}
                    >
                      {p.title}
                    </div>
                    <div
                      className="mono"
                      style={{ fontSize: 10, color: "var(--muted)", opacity: 0.65 }}
                    >
                      {p.category}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* CATEGORY TAGS */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 24, flexShrink: 0 }}>
            {categories.slice(0, 7).map((cat) => (
              <Link
                key={cat}
                href={`/work?cat=${encodeURIComponent(cat)}`}
                style={{
                  padding: "5px 12px",
                  border: "1px solid var(--rule)",
                  borderRadius: 999,
                  fontSize: 9,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
                  color: "var(--muted)",
                }}
              >
                {cat}
              </Link>
            ))}
          </div>

          <div style={{ flex: 1, minHeight: 16 }} />

          {/* DESCRIPTION */}
          <p
            className="mono"
            style={{
              fontSize: 10,
              color: "var(--muted)",
              lineHeight: 1.8,
              marginBottom: 18,
              maxWidth: 300,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            Design & development — selected work spanning identity, interfaces & digital products.
          </p>

          {/* LARGE HEADING */}
          <h1
            style={{
              fontSize: "clamp(44px, 5.2vw, 76px)",
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              color: "var(--fg)",
              margin: 0,
              flexShrink: 0,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              Khalil
              <span
                aria-hidden
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 14,
                  background: "var(--accent)",
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              />
              <span aria-hidden style={{ fontWeight: 700 }}>✳</span>
            </span>
            Portfolio
          </h1>
        </div>

        {/* RIGHT HERO IMAGE */}
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            background: "#0a0a0a",
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* MENU BUTTON */}
          <button
            onClick={() => setMenuOpen(true)}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              zIndex: 10,
              background: "#0a0a0a",
              color: "#f0eee8",
              padding: "9px 20px",
              borderRadius: 999,
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
              border: "1px solid rgba(255,255,255,0.18)",
              cursor: "pointer",
            }}
          >
            MENU
          </button>

          {/* SLIDE DOTS */}
          <div
            style={{
              position: "absolute",
              top: 26,
              left: 24,
              zIndex: 10,
              display: "flex",
              gap: 5,
            }}
          >
            {projects.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  width: i === active ? 24 : 7,
                  height: 2,
                  background: i === active ? "#f0eee8" : "rgba(240,238,232,0.22)",
                  border: "none",
                  cursor: "pointer",
                  transition: "width 400ms ease, background 400ms",
                  padding: 0,
                  borderRadius: 1,
                }}
              />
            ))}
          </div>

          {/* GHOST PROJECT NUMBER */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2,
              pointerEvents: "none",
              opacity: 0.055,
              fontWeight: 900,
              fontSize: "22vw",
              color: "#fff",
              lineHeight: 1,
              letterSpacing: "-0.05em",
              userSelect: "none",
              fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
              transition: "opacity 600ms",
            }}
          >
            {String(active + 1).padStart(2, "0")}
          </div>

          {/* CROSSFADE PROJECT IMAGES */}
          {projects.map((p, i) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                inset: 0,
                opacity: i === active ? 1 : 0,
                transition: "opacity 900ms cubic-bezier(0.4,0,0.15,1)",
                zIndex: i === active ? 3 : 1,
              }}
            >
              <Placeholder
                label={p.renderLabel}
                ratio="auto"
                tone="dark"
                variant="schematic"
                accent={accentColor(p.accent)}
                src={
                  p.thumbnailUrl ||
                  p.renderUrl ||
                  p.gallery?.[0]?.url ||
                  `https://picsum.photos/seed/${p.id}/1200/900?grayscale`
                }
                objectPosition={
                  p.thumbnailUrl
                    ? `${p.thumbnailX ?? 50}% ${p.thumbnailY ?? 50}%`
                    : undefined
                }
                style={{ width: "100%", height: "100%", display: "block" }}
                showCorners={false}
              />
            </div>
          ))}

          {/* BOTTOM GRADIENT + INFO */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              padding: "48px 24px 22px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)",
            }}
          >
            <div>
              <div
                className="mono"
                style={{
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(240,238,232,0.45)",
                  marginBottom: 4,
                }}
              >
                {project.category} · {project.year}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#f0eee8",
                  letterSpacing: "-0.01em",
                }}
              >
                {project.title}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Link
                href={`/work/${project.id}`}
                className="mono"
                style={{
                  fontSize: 9,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(240,238,232,0.65)",
                  borderBottom: "1px solid rgba(240,238,232,0.28)",
                  paddingBottom: 2,
                }}
              >
                VIEW PROJECT
              </Link>
              <div style={{ display: "flex", gap: 3, opacity: 0.28 }}>
                {[10, 16, 12].map((h, j) => (
                  <div
                    key={j}
                    style={{ width: 2, height: h, background: "#f0eee8" }}
                  />
                ))}
              </div>
              <span
                className="mono"
                style={{
                  fontSize: 9,
                  letterSpacing: "0.15em",
                  color: "rgba(240,238,232,0.3)",
                  textTransform: "uppercase",
                }}
              >
                ALL RIGHTS RESERVED ©
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── OFF-CANVAS MENU ── */}
      <div
        onClick={() => setMenuOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 400ms ease",
          zIndex: 90,
        }}
      />
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "min(520px, 100vw)",
          background: "#0a0a0a",
          color: "#f0eee8",
          zIndex: 100,
          transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 520ms cubic-bezier(0.7,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            height: 64,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span
            className="mono"
            style={{ fontSize: 10, letterSpacing: "0.24em", opacity: 0.38, textTransform: "uppercase" }}
          >
            INDEX · NAVIGATION
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.24em",
              color: "#f0eee8",
              padding: "7px 14px",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "transparent",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            CLOSE [ESC]
          </button>
        </div>

        <nav style={{ flex: 1, padding: "32px 24px", display: "flex", flexDirection: "column" }}>
          {MENU_ITEMS.map((it, i) => (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "grid",
                gridTemplateColumns: "52px 1fr auto",
                alignItems: "baseline",
                gap: 16,
                padding: "18px 8px",
                borderTop: i === 0 ? "1px solid rgba(255,255,255,0.08)" : "none",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                color: "#f0eee8",
              }}
            >
              <span
                className="mono"
                style={{ fontSize: 10, opacity: 0.32, letterSpacing: "0.18em" }}
              >
                {it.num}
              </span>
              <span
                style={{
                  fontSize: "min(7vw, 50px)",
                  fontWeight: 300,
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase",
                  lineHeight: 1,
                }}
              >
                {it.label}
              </span>
              <span style={{ opacity: 0.32, fontSize: 12 }}>↗</span>
            </Link>
          ))}
        </nav>

        <div
          className="mono"
          style={{
            padding: "18px 24px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            fontSize: 9,
            letterSpacing: "0.24em",
            opacity: 0.32,
            display: "flex",
            justifyContent: "space-between",
            textTransform: "uppercase",
          }}
        >
          <span>© KHALIL · 2026</span>
          <span>AVAILABLE · Q3 2026</span>
        </div>
      </aside>
    </div>
  );
}

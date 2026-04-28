"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Placeholder } from "@/components/Placeholder";
import { Footer } from "@/components/Footer";

export function AboutContent({
  bio,
  timeline,
  labels,
}: {
  bio: string[];
  timeline: [string, string, string][];
  labels: {
    profile: string;
    bio: string;
    trajectory: string;
    commission: string;
    welcome: string;
    cta: string;
    portrait: string;
    nameLine1: string;
    nameLine2: string;
  };
}) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <article data-screen-label="04 About" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <section
        data-header-theme="dark"
        style={{
          position: "relative",
          height: "82vh",
          minHeight: 520,
          overflow: "hidden",
          background: "var(--bg)",
          color: "var(--fg)",
          paddingTop: 64,
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
            label={labels.portrait}
            ratio="auto"
            tone="dark"
            variant="schematic"
            accent="var(--accent)"
            src="https://picsum.photos/seed/khalil-portrait/1600/2000?grayscale"
            style={{ width: "100%", height: "100vh" }}
            showCorners={false}
          />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "0 24px 64px",
            color: "#f0eee8",
          }}
        >
          <div className="smallcaps" style={{ opacity: 0.7, marginBottom: 16 }}>
            · 02 · {labels.profile}
          </div>
          <h1
            className="display"
            style={{
              fontSize: "clamp(56px, 12vw, 220px)",
              margin: 0,
              fontWeight: 300,
              maxWidth: 1400,
            }}
          >
            {labels.nameLine1}
            <br />
            <span style={{ color: "var(--accent)" }}>{labels.nameLine2}</span>
          </h1>
        </div>
      </section>

      <section
        data-header-theme="light"
        style={{ padding: "120px 24px", maxWidth: 880, margin: "0 auto" }}
      >
        <div className="smallcaps" style={{ color: "var(--muted)", marginBottom: 24 }}>
          · {labels.bio}
        </div>
        {bio.map((p, i) => (
          <p
            key={i}
            className="body-text"
            style={{
              fontSize: i === 0 ? 22 : 18,
              fontWeight: 300,
              lineHeight: 1.65,
              marginTop: i === 0 ? 0 : 24,
              marginBottom: 0,
            }}
          >
            {p}
          </p>
        ))}
      </section>

      <section
        style={{
          padding: "64px 24px 120px",
          maxWidth: 1280,
          margin: "0 auto",
          borderTop: "1px solid var(--rule)",
        }}
      >
        <div
          className="smallcaps"
          style={{ color: "var(--muted)", marginBottom: 40, marginTop: 40 }}
        >
          · {labels.trajectory}
        </div>
        <div>
          {timeline.map(([year, role, place], i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr 1fr",
                gap: 24,
                padding: "20px 0",
                borderBottom: "1px solid var(--rule)",
                alignItems: "baseline",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
                  fontSize: 13,
                  letterSpacing: "0.18em",
                  color: "var(--muted)",
                }}
              >
                {year}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
                  fontWeight: 400,
                  fontSize: 22,
                  letterSpacing: "-0.01em",
                  textTransform: "uppercase",
                }}
              >
                {role}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 16,
                  color: "var(--muted)",
                  fontWeight: 300,
                }}
              >
                {place}
              </div>
            </div>
          ))}
        </div>
      </section>

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
        <div className="smallcaps" style={{ opacity: 0.55, marginBottom: 24 }}>
          · 03 · {labels.commission}
        </div>
        <h2
          className="display"
          style={{
            fontSize: "clamp(40px, 7vw, 120px)",
            fontWeight: 300,
            margin: 0,
            maxWidth: 1100,
            marginInline: "auto",
          }}
        >
          {labels.welcome}
        </h2>
        <Link
          href="/contact"
          data-cursor="CONTACT"
          style={{
            marginTop: 48,
            display: "inline-flex",
            color: "var(--bg)",
            background: "var(--fg)",
            fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
            fontSize: 12,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            padding: "16px 24px",
            alignItems: "center",
            gap: 12,
          }}
        >
          {labels.cta} →
        </Link>
      </section>

      <Footer />
    </article>
  );
}

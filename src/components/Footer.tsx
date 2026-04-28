import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--rule)",
        padding: "32px 24px 28px",
        background: "var(--bg)",
        color: "var(--fg)",
        fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
        fontSize: 11,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ color: "var(--muted)" }}>© 2026 · Khalil — Automotive Designer</span>
      <div style={{ display: "flex", gap: 24, color: "var(--muted)" }}>
        <Link href="/contact" data-cursor="CONTACT">
          Studio
        </Link>
        <a href="#" data-cursor="CV">
          CV / PDF
        </a>
        <a href="#" data-cursor="INSTAGRAM">
          Instagram
        </a>
        <a href="#" data-cursor="LINKEDIN">
          LinkedIn
        </a>
      </div>
      <span style={{ color: "var(--muted)" }}>Paris · Turin</span>
    </footer>
  );
}

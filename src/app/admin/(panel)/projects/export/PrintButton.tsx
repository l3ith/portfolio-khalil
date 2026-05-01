"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        padding: "10px 20px",
        background: "var(--fg)",
        color: "var(--bg)",
        border: "1px solid var(--fg)",
        fontFamily: "var(--font-jetbrains-mono)",
        fontSize: 11,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      ↓ Save as PDF / Print
    </button>
  );
}

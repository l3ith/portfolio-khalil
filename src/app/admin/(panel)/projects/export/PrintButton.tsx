"use client";

import { useState } from "react";

const btnBase: React.CSSProperties = {
  padding: "10px 20px",
  border: "1px solid",
  fontFamily: "var(--font-jetbrains-mono)",
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

export function PrintButton() {
  const [loading, setLoading] = useState(false);

  async function downloadPdf() {
    setLoading(true);
    try {
      const res = await fetch("/api/export/projects-pdf");
      if (!res.ok) throw new Error("Generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `portfolio-projects-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF generation failed. Check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button
        onClick={downloadPdf}
        disabled={loading}
        style={{
          ...btnBase,
          background: "var(--fg)",
          color: "var(--bg)",
          borderColor: "var(--fg)",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "· Generating…" : "↓ Download PDF"}
      </button>
      <button
        onClick={() => window.print()}
        style={{
          ...btnBase,
          background: "transparent",
          color: "var(--muted)",
          borderColor: "var(--rule)",
        }}
      >
        ⎙ Print
      </button>
    </div>
  );
}

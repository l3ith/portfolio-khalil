import type { CSSProperties } from "react";

export const adminInputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "rgba(10,10,10,0.04)",
  border: "1px solid var(--rule)",
  color: "var(--fg)",
  fontFamily: "var(--font-inter)",
  fontSize: 14,
  fontWeight: 300,
  outline: "none",
  borderRadius: 0,
};

export const adminLabelStyle: CSSProperties = {
  fontFamily: "var(--font-jetbrains-mono)",
  fontSize: 10,
  letterSpacing: "0.24em",
  textTransform: "uppercase",
  color: "var(--muted)",
  marginBottom: 6,
};

export const adminButtonStyle: CSSProperties = {
  padding: "10px 16px",
  background: "var(--fg)",
  color: "var(--bg)",
  border: "1px solid var(--fg)",
  fontFamily: "var(--font-jetbrains-mono)",
  fontSize: 11,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  cursor: "pointer",
};

export const adminTableStyle = {
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    border: "1px solid var(--rule)",
  },
  th: {
    textAlign: "left" as const,
    padding: "12px 16px",
    fontFamily: "var(--font-jetbrains-mono)",
    fontSize: 10,
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
    color: "var(--muted)",
    borderBottom: "1px solid var(--rule)",
    background: "rgba(10,10,10,0.02)",
  },
  td: {
    padding: "14px 16px",
    fontFamily: "var(--font-inter)",
    fontSize: 14,
    fontWeight: 300,
    borderBottom: "1px solid var(--rule)",
    color: "var(--fg)",
    verticalAlign: "middle" as const,
  },
};

export function adminPageHeader(title: string, subtitle?: string) {
  return (
    <header style={{ borderBottom: "1px solid var(--rule)", paddingBottom: 24 }}>
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 11,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 12,
        }}
      >
        · Console
      </div>
      <h1
        style={{
          fontFamily: "var(--font-space-grotesk)",
          fontWeight: 300,
          fontSize: 48,
          letterSpacing: "-0.02em",
          margin: 0,
          textTransform: "uppercase",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 11,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginTop: 8,
          }}
        >
          · {subtitle}
        </div>
      )}
    </header>
  );
}

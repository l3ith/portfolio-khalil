import { db } from "@/lib/db";

export type ThemeSettings = {
  bgLight: string;
  fgLight: string;
  mutedLight: string;
  bgDark: string;
  fgDark: string;
  mutedDark: string;
  accentL: number;
  accentC: number;
  accentH: number;
  fontDisplay: string;
  fontMono: string;
  fontBody: string;
};

const DEFAULTS: ThemeSettings = {
  bgLight: "#f4f3ef",
  fgLight: "#0a0a0a",
  mutedLight: "#737373",
  bgDark: "#050505",
  fgDark: "#f0eee8",
  mutedDark: "rgba(240,238,232,0.55)",
  accentL: 0.78,
  accentC: 0.17,
  accentH: 75,
  fontDisplay: "Space Grotesk",
  fontMono: "JetBrains Mono",
  fontBody: "Inter",
};

export async function getActiveTheme(): Promise<ThemeSettings> {
  try {
    const s = await db.setting.findFirst();
    if (!s) return DEFAULTS;
    return {
      bgLight: s.bgLight,
      fgLight: s.fgLight,
      mutedLight: s.mutedLight,
      bgDark: s.bgDark,
      fgDark: s.fgDark,
      mutedDark: s.mutedDark,
      accentL: s.accentL,
      accentC: s.accentC,
      accentH: s.accentH,
      fontDisplay: s.fontDisplay,
      fontMono: s.fontMono,
      fontBody: s.fontBody,
    };
  } catch {
    return DEFAULTS;
  }
}

export function themeToCss(t: ThemeSettings) {
  return [
    `:root{`,
    `--bg:${t.bgLight};`,
    `--fg:${t.fgLight};`,
    `--muted:${t.mutedLight};`,
    `--rule:rgba(10,10,10,0.14);`,
    `--tint:${t.accentL} ${t.accentC} ${t.accentH};`,
    `--accent:oklch(var(--tint));`,
    `--font-space-grotesk:"${t.fontDisplay}",sans-serif;`,
    `--font-jetbrains-mono:"${t.fontMono}",ui-monospace,monospace;`,
    `--font-inter:"${t.fontBody}",system-ui,sans-serif;`,
    `}`,
    `[data-theme="dark"]{`,
    `--bg:${t.bgDark};`,
    `--fg:${t.fgDark};`,
    `--muted:${t.mutedDark};`,
    `--rule:rgba(240,238,232,0.16);`,
    `}`,
    `body{font-family:var(--font-inter);}`,
  ].join("");
}

export function googleFontsUrl(t: ThemeSettings) {
  const families = [t.fontDisplay, t.fontMono, t.fontBody]
    .filter((v, i, a) => a.indexOf(v) === i)
    .map((n) => `family=${n.replace(/ /g, "+")}:wght@300;400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

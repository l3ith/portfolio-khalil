import React from "react";
import { Font, Link, Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { ThemeSettings } from "@/lib/theme";

// Renders the TipTap HTML of project text blocks with react-pdf, mirroring the
// public `.body-text.rich-content` styles (globals.css) scaled from site px to PDF pt.

export type RichTextTheme = {
  body: string;
  display: string;
  mono: string;
  fg: string;
  muted: string;
  accent: string;
  rule: string;
  scale: number; // PDF pt per site px
};

// ── fonts ─────────────────────────────────────────────────────────────────────
// Google Fonts serves static TTF (the only format react-pdf reads) to non-browser
// clients. Registration is per process, so each family is fetched once.
const registered = new Map<string, Promise<boolean>>();

async function registerGoogleFont(name: string): Promise<boolean> {
  const base = `https://fonts.googleapis.com/css2?family=${name.trim().replace(/ /g, "+")}`;
  const queries = [
    `${base}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700`,
    `${base}:wght@300;400;500;600;700`,
    base,
  ];
  for (const url of queries) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const css = await res.text();
      const fonts = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].flatMap(([, block]) => {
        const src = block.match(/url\((https:[^)]+\.ttf)\)/)?.[1];
        if (!src) return [];
        return [
          {
            src,
            fontWeight: Number(block.match(/font-weight:\s*(\d+)/)?.[1] ?? 400),
            fontStyle: (block.match(/font-style:\s*(\w+)/)?.[1] ?? "normal") as "normal" | "italic",
          },
        ];
      });
      if (fonts.length === 0) continue;
      Font.register({ family: name, fonts });
      return true;
    } catch {
      // try the next, less demanding query
    }
  }
  return false;
}

function ensureFont(name: string) {
  if (!registered.has(name)) registered.set(name, registerGoogleFont(name));
  return registered.get(name)!;
}

// The site never hyphenates; react-pdf does by default.
Font.registerHyphenationCallback((word) => [word]);

export async function loadSiteFonts(theme: ThemeSettings) {
  const [body, display, mono] = await Promise.all([
    ensureFont(theme.fontBody),
    ensureFont(theme.fontDisplay),
    ensureFont(theme.fontMono),
  ]);
  return {
    body: body ? theme.fontBody : "Helvetica",
    display: display ? theme.fontDisplay : "Helvetica",
    mono: mono ? theme.fontMono : "Courier",
  };
}

// ── HTML parsing ──────────────────────────────────────────────────────────────
type HNode =
  | { type: "el"; tag: string; attrs: Record<string, string>; children: HNode[] }
  | { type: "text"; text: string };
type HElement = Extract<HNode, { type: "el" }>;

const VOID_TAGS = new Set(["br", "hr", "img", "wbr"]);
const BLOCK_TAGS = new Set(["p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "blockquote", "hr", "div", "pre"]);

function decodeEntities(s: string) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, "&");
}

function parseHtml(html: string): HNode[] {
  const root: HElement = { type: "el", tag: "root", attrs: {}, children: [] };
  const stack: HElement[] = [root];
  const re = /<!--[\s\S]*?-->|<\/([a-zA-Z0-9]+)[^>]*>|<([a-zA-Z0-9]+)([^>]*?)\/?>|([^<]+)|</g;
  for (const m of html.matchAll(re)) {
    const top = stack[stack.length - 1];
    if (m[1]) {
      const tag = m[1].toLowerCase();
      const at = stack.findLastIndex((n) => n.tag === tag);
      if (at > 0) stack.length = at;
    } else if (m[2]) {
      const tag = m[2].toLowerCase();
      const attrs: Record<string, string> = {};
      for (const a of (m[3] ?? "").matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
        attrs[a[1].toLowerCase()] = decodeEntities(a[2] ?? a[3] ?? "");
      }
      const el: HElement = { type: "el", tag, attrs, children: [] };
      top.children.push(el);
      if (!VOID_TAGS.has(tag)) stack.push(el);
    } else if (m[4]) {
      top.children.push({ type: "text", text: decodeEntities(m[4]) });
    }
  }
  return root.children;
}

// ── rendering ─────────────────────────────────────────────────────────────────
type Ctx = { t: RichTextTheme; size: number; color: string; italic: boolean };

const isBlock = (n: HNode) => n.type === "el" && BLOCK_TAGS.has(n.tag);
const textAlign = (n: HElement) =>
  n.attrs.style?.match(/text-align:\s*(left|center|right|justify)/)?.[1] as Style["textAlign"] | undefined;

function inline(nodes: HNode[], ctx: Ctx, key = "i"): React.ReactNode[] {
  return nodes.map((n, i) => {
    const k = `${key}.${i}`;
    if (n.type === "text") return n.text.replace(/[ \t\r\n]+/g, " ");
    const kids = () => inline(n.children, ctx, k);
    switch (n.tag) {
      case "br":
        return "\n";
      case "strong":
      case "b":
        return React.createElement(Text, { key: k, style: { fontWeight: 600 } }, ...kids());
      case "em":
      case "i":
        return React.createElement(Text, { key: k, style: { fontStyle: "italic" } }, ...kids());
      case "u":
        return React.createElement(Text, { key: k, style: { textDecoration: "underline" } }, ...kids());
      case "s":
      case "strike":
      case "del":
        return React.createElement(Text, { key: k, style: { textDecoration: "line-through" } }, ...kids());
      case "code":
        return React.createElement(
          Text,
          { key: k, style: { fontFamily: ctx.t.mono, fontSize: ctx.size * 0.9, backgroundColor: "#ececec" } },
          ...kids()
        );
      case "a":
        return React.createElement(
          Link,
          { key: k, src: n.attrs.href ?? "", style: { color: ctx.t.accent, textDecoration: "underline" } },
          ...kids()
        );
      default:
        return React.createElement(React.Fragment, { key: k }, ...kids());
    }
  });
}

function paragraph(nodes: HNode[], ctx: Ctx, style: Style, key: string) {
  return React.createElement(
    Text,
    {
      key,
      style: {
        fontFamily: ctx.t.body,
        fontWeight: 300,
        fontSize: ctx.size,
        lineHeight: 1.65,
        color: ctx.color,
        fontStyle: ctx.italic ? "italic" : "normal",
        ...style,
      },
    },
    ...inline(nodes, ctx, key)
  );
}

// `.rich-content > * + * { margin-top: 1em }`; headings carry their own top margin.
function blocks(nodes: HNode[], ctx: Ctx, key = "b"): React.ReactElement[] {
  // Loose inline content (no wrapping <p>) behaves like an anonymous paragraph.
  const groups: HNode[][] = [];
  for (const n of nodes) {
    if (n.type === "text" && !n.text.trim() && !groups.length) continue;
    if (isBlock(n)) groups.push([n]);
    else if (groups.length && !isBlock(groups[groups.length - 1][0])) groups[groups.length - 1].push(n);
    else groups.push([n]);
  }

  const out: React.ReactElement[] = [];
  groups.forEach((group, i) => {
    const k = `${key}.${i}`;
    const first = out.length === 0;
    const n = group[0];
    const mt = (em: number) => (first ? 0 : em);

    if (n.type === "text" || !isBlock(n)) {
      if (group.every((g) => g.type === "text" && !g.text.trim())) return;
      out.push(paragraph(group, ctx, { marginTop: mt(ctx.size) }, k));
      return;
    }

    const s = ctx.t.scale;
    switch (n.tag) {
      case "p":
        out.push(paragraph(n.children, ctx, { marginTop: mt(ctx.size), textAlign: textAlign(n) }, k));
        break;
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6": {
        const spec =
          n.tag === "h1" || n.tag === "h2"
            ? { size: 28 * s, weight: 400, lh: 1.2, mt: 1.5 }
            : n.tag === "h3"
              ? { size: 22 * s, weight: 400, lh: 1.25, mt: 1.2 }
              : { size: 18 * s, weight: 500, lh: 1.7, mt: 1 };
        out.push(
          React.createElement(
            Text,
            {
              key: k,
              style: {
                fontFamily: ctx.t.display,
                fontSize: spec.size,
                fontWeight: spec.weight,
                lineHeight: spec.lh,
                marginTop: spec.size * spec.mt,
                color: ctx.color,
                textAlign: textAlign(n),
              },
            },
            ...inline(n.children, { ...ctx, size: spec.size }, k)
          )
        );
        break;
      }
      case "ul":
      case "ol": {
        const items = n.children.filter((c): c is HElement => c.type === "el" && c.tag === "li");
        const start = Number(n.attrs.start ?? 1);
        out.push(
          React.createElement(
            View,
            { key: k, style: { marginTop: mt(ctx.size) } },
            ...items.map((li, j) =>
              React.createElement(
                View,
                { key: `${k}.${j}`, style: { flexDirection: "row", marginTop: j === 0 ? 0 : ctx.size * 0.3 } },
                React.createElement(
                  Text,
                  {
                    style: {
                      width: ctx.size * 1.4,
                      paddingRight: ctx.size * 0.4,
                      textAlign: "right",
                      fontFamily: ctx.t.body,
                      fontWeight: 300,
                      fontSize: ctx.size,
                      lineHeight: 1.65,
                      color: ctx.color,
                    },
                  },
                  n.tag === "ol" ? `${start + j}.` : "•"
                ),
                React.createElement(View, { style: { flex: 1 } }, ...blocks(li.children, ctx, `${k}.${j}`))
              )
            )
          )
        );
        break;
      }
      case "blockquote":
        out.push(
          React.createElement(
            View,
            {
              key: k,
              style: {
                marginTop: mt(ctx.size),
                borderLeftWidth: 2,
                borderLeftColor: ctx.t.accent,
                paddingLeft: 16 * s,
              },
            },
            ...blocks(n.children, { ...ctx, color: ctx.t.muted, italic: true }, k)
          )
        );
        break;
      case "hr":
        out.push(
          React.createElement(View, {
            key: k,
            style: { borderTopWidth: 1, borderTopColor: ctx.t.rule, marginVertical: ctx.size * 1.5 },
          })
        );
        break;
      default: // div, pre
        out.push(
          React.createElement(View, { key: k, style: { marginTop: mt(ctx.size) } }, ...blocks(n.children, ctx, k))
        );
    }
  });
  return out;
}

// Site reference: ProjectTextBlock in ProjectDetail.tsx — maxWidth 720/1080/100%,
// block margin left/center/right, padding 48px 0, font-size 19px.
const BLOCK_WIDTHS: Record<string, number> = { narrow: 720, wide: 1080 };
const BLOCK_ALIGN: Record<string, Style["alignSelf"]> = { left: "flex-start", center: "center", right: "flex-end" };

export function hasRichText(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;
}

export function RichTextBlock({
  html,
  width,
  align,
  columnWidth,
  theme,
}: {
  html: string;
  width: string;
  align: string;
  columnWidth: number;
  theme: RichTextTheme;
}) {
  const s = theme.scale;
  const w = width in BLOCK_WIDTHS ? Math.min(columnWidth, BLOCK_WIDTHS[width] * s) : columnWidth;
  return React.createElement(
    View,
    {
      style: {
        width: w,
        alignSelf: BLOCK_ALIGN[align] ?? "center",
        paddingVertical: 48 * s,
      },
    },
    ...blocks(parseHtml(html), { t: theme, size: 19 * s, color: theme.fg, italic: false })
  );
}

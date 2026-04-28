"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";
type Lang = "EN" | "FR";

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}
function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

function useLang(): [Lang, (l: Lang) => void] {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("EN");
  useEffect(() => {
    const saved = readCookie("lang");
    if (saved === "fr") setLang("FR");
  }, []);
  const update = (l: Lang) => {
    setLang(l);
    writeCookie("lang", l.toLowerCase());
    router.refresh();
  };
  return [lang, update];
}

function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme) || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const update = (t: Theme) => {
    setTheme(t);
    localStorage.setItem("theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  return [theme, update];
}

export function Header({
  logoUrl,
  logoHeight = 28,
}: {
  logoUrl?: string | null;
  logoHeight?: number;
}) {
  const pathname = usePathname();
  const [theme, setTheme] = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          zIndex: 50,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "0 24px",
          color: "var(--fg)",
          transition: "color 320ms cubic-bezier(0.4,0,0.15,1)",
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-start", pointerEvents: "auto" }}>
          <Hamburger onClick={() => setMenuOpen(true)} />
        </div>

        <Link
          href="/"
          data-cursor="HOME"
          aria-hidden={scrolled || undefined}
          tabIndex={scrolled ? -1 : 0}
          style={{
            pointerEvents: scrolled ? "none" : "auto",
            opacity: scrolled ? 0 : 1,
            transform: scrolled ? "translateY(-8px)" : "translateY(0)",
            transition:
              "opacity 320ms cubic-bezier(0.4,0,0.15,1), transform 320ms cubic-bezier(0.4,0,0.15,1)",
            fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
            fontWeight: 500,
            fontSize: 15,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: "var(--fg)",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="KHALIL"
              style={{ height: logoHeight, width: "auto", display: "block" }}
            />
          ) : (
            <>
              <span
                aria-hidden
                style={{
                  width: 10,
                  height: 10,
                  background: "var(--accent)",
                  display: "inline-block",
                  transform: "rotate(45deg)",
                  opacity: 0.95,
                }}
              />
              KHALIL
            </>
          )}
        </Link>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 12,
            pointerEvents: "auto",
          }}
        >
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </header>

      <OffCanvasMenu open={menuOpen} onClose={() => setMenuOpen(false)} pathname={pathname} />
    </>
  );
}

function ThemeToggle({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      data-cursor={isDark ? "LIGHT" : "DARK"}
      aria-label="Toggle theme"
      style={{
        width: 32,
        height: 32,
        border: "1px solid var(--fg)",
        borderRadius: 999,
        color: "var(--fg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        lineHeight: 1,
        transition: "background 320ms, color 320ms",
      }}
    >
      {isDark ? "☀" : "☾"}
    </button>
  );
}

function Hamburger({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-cursor="MENU"
      aria-label="Open menu"
      style={{
        width: 40,
        height: 40,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 6,
        padding: "0 6px",
        color: "var(--fg)",
      }}
    >
      <span
        style={{
          display: "block",
          height: 1,
          background: "var(--fg)",
          width: hover ? 28 : 16,
          transition: "width 320ms cubic-bezier(0.4,0,0.15,1)",
        }}
      />
      <span
        style={{
          display: "block",
          height: 1,
          background: "var(--fg)",
          width: hover ? 16 : 28,
          transition: "width 320ms cubic-bezier(0.4,0,0.15,1)",
        }}
      />
    </button>
  );
}

function _LangSwitchUnused({
  lang,
  setLang,
}: {
  lang: "EN" | "FR";
  setLang: (l: "EN" | "FR") => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        border: "1px solid var(--fg)",
        borderRadius: 999,
        overflow: "hidden",
        fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
        fontSize: 11,
        letterSpacing: "0.18em",
      }}
    >
      {(["EN", "FR"] as const).map((l) => {
        const active = lang === l;
        return (
          <button
            key={l}
            data-cursor={l}
            onClick={() => setLang(l)}
            style={{
              padding: "6px 14px",
              color: active ? "var(--bg)" : "var(--fg)",
              background: active ? "var(--fg)" : "transparent",
              transition: "background 320ms, color 320ms",
            }}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}

function OffCanvasMenu({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const items = [
    { href: "/", label: "Index", num: "00" },
    { href: "/work", label: "Work", num: "01" },
    { href: "/about", label: "About", num: "02" },
    { href: "/contact", label: "Contact", num: "03" },
  ];

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
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
          width: "min(560px, 100vw)",
          background: "var(--fg)",
          color: "var(--bg)",
          zIndex: 100,
          transform: open ? "translateX(0)" : "translateX(-100%)",
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
            borderBottom: "1px solid var(--bg)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
              fontSize: 11,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              opacity: 0.6,
            }}
          >
            Index · Navigation
          </div>
          <button
            onClick={onClose}
            data-cursor="CLOSE"
            style={{
              fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
              fontSize: 11,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "var(--bg)",
              padding: "8px 12px",
              border: "1px solid var(--bg)",
            }}
          >
            Close [esc]
          </button>
        </div>

        <nav
          style={{ flex: 1, padding: "32px 24px", display: "flex", flexDirection: "column", gap: 4 }}
        >
          {items.map((it, i) => {
            const active =
              pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href));
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={onClose}
                data-cursor="OPEN"
                style={{
                  textAlign: "left",
                  display: "grid",
                  gridTemplateColumns: "60px 1fr auto",
                  alignItems: "baseline",
                  gap: 16,
                  padding: "20px 8px",
                  borderTop: i === 0 ? "1px solid var(--bg)" : "none",
                  borderBottom: "1px solid var(--bg)",
                  color: active ? "var(--accent)" : "var(--bg)",
                  transition: "color 320ms",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    opacity: 0.55,
                  }}
                >
                  {it.num}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
                    fontWeight: 300,
                    fontSize: "min(7vw, 56px)",
                    letterSpacing: "-0.02em",
                    textTransform: "uppercase",
                    lineHeight: 1,
                  }}
                >
                  {it.label}
                </span>
                <span
                  aria-hidden
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
                    fontSize: 12,
                    opacity: 0.5,
                  }}
                >
                  ↗
                </span>
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            padding: "20px 24px",
            borderTop: "1px solid var(--bg)",
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
            fontSize: 10,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            opacity: 0.5,
          }}
        >
          <span>© Khalil · 2026</span>
          <span>Available · Q3 2026</span>
        </div>
      </aside>
    </>
  );
}

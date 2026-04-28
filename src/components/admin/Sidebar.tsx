"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: IconDashboard, exact: true },
  { href: "/admin/projects", label: "Projects", icon: IconFolder },
  { href: "/admin/categories", label: "Categories", icon: IconTag },
  { href: "/admin/about", label: "About", icon: IconUser },
  { href: "/admin/messages", label: "Messages", icon: IconMail },
  { href: "/admin/settings", label: "Settings", icon: IconSettings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar") === "collapsed";
    setCollapsed(saved);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("admin-sidebar", next ? "collapsed" : "open");
  };

  if (!mounted) {
    return <aside style={{ width: 248, flexShrink: 0 }} />;
  }

  return (
    <>
      <aside
        style={{
          width: collapsed ? 0 : 248,
          height: "100vh",
          background: "#0a0a0a",
          color: "#f0eee8",
          borderRight: collapsed ? "none" : "1px solid rgba(240,238,232,0.12)",
          overflow: "hidden",
          transition: "width 320ms cubic-bezier(0.4,0,0.15,1)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px 20px",
            borderBottom: "1px solid rgba(240,238,232,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 64,
          }}
        >
          <Link
            href="/admin"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 500,
              fontSize: 13,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "#f0eee8",
              display: "flex",
              alignItems: "center",
              gap: 10,
              whiteSpace: "nowrap",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                background: "var(--accent)",
                display: "inline-block",
                transform: "rotate(45deg)",
              }}
            />
            KHALIL · ADMIN
          </Link>
          <button
            onClick={toggle}
            aria-label="Collapse sidebar"
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(240,238,232,0.18)",
              color: "#f0eee8",
              fontSize: 11,
            }}
          >
            ‹
          </button>
        </div>

        <nav
          style={{
            flex: 1,
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {ITEMS.map((it) => {
            const active = it.exact
              ? pathname === it.href
              : pathname === it.href || pathname.startsWith(it.href + "/");
            const Icon = it.icon;
            return (
              <Link
                key={it.href}
                href={it.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "10px 12px",
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: 12,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: active ? "var(--accent)" : "rgba(240,238,232,0.78)",
                  background: active ? "rgba(240,238,232,0.05)" : "transparent",
                  borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                  whiteSpace: "nowrap",
                  transition: "color 200ms, background 200ms",
                }}
              >
                <Icon active={active} />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <form
          action="/admin/logout"
          method="post"
          style={{
            padding: "16px 12px",
            borderTop: "1px solid rgba(240,238,232,0.12)",
          }}
        >
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid rgba(240,238,232,0.18)",
              color: "rgba(240,238,232,0.78)",
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              textAlign: "left",
            }}
          >
            ← Logout
          </button>
        </form>
      </aside>

      {collapsed && (
        <button
          onClick={toggle}
          aria-label="Expand sidebar"
          style={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 60,
            width: 40,
            height: 40,
            background: "#0a0a0a",
            color: "#f0eee8",
            border: "1px solid rgba(240,238,232,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}
        >
          ›
        </button>
      )}
    </>
  );
}

function IconDashboard({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" stroke="currentColor" />
      <rect x="8" y="1" width="5" height="5" stroke="currentColor" />
      <rect x="1" y="8" width="5" height="5" stroke="currentColor" />
      <rect
        x="8"
        y="8"
        width="5"
        height="5"
        stroke="currentColor"
        fill={active ? "currentColor" : "none"}
      />
    </svg>
  );
}
function IconFolder() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 3h4l1 1.5h7V12H1z" stroke="currentColor" />
    </svg>
  );
}
function IconTag() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 2h6l5 5-6 6-5-5z" stroke="currentColor" />
      <circle cx="4.5" cy="4.5" r="0.8" fill="currentColor" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="5" r="2.5" stroke="currentColor" />
      <path d="M2 12c1-3 3-4 5-4s4 1 5 4" stroke="currentColor" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="3" width="12" height="8" stroke="currentColor" />
      <path d="M1 3l6 5 6-5" stroke="currentColor" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2" stroke="currentColor" />
      <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.8 2.8l1.4 1.4M9.8 9.8l1.4 1.4M2.8 11.2l1.4-1.4M9.8 4.2l1.4-1.4" stroke="currentColor" />
    </svg>
  );
}

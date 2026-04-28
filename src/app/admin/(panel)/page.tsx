import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  const [projects, categories, unreadMessages, recentMessages] = await Promise.all([
    db.project.count(),
    db.category.count(),
    db.message.count({ where: { read: false } }),
    db.message.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`Welcome, ${session?.email ?? "admin"}.`} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginTop: 32,
        }}
      >
        <Stat label="Projects" value={projects} href="/admin/projects" />
        <Stat label="Categories" value={categories} href="/admin/categories" />
        <Stat
          label="Unread messages"
          value={unreadMessages}
          href="/admin/messages"
          highlight={unreadMessages > 0}
        />
      </div>

      <section style={{ marginTop: 56 }}>
        <h2
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 11,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "var(--muted)",
            margin: "0 0 16px",
          }}
        >
          · Recent messages
        </h2>
        {recentMessages.length === 0 ? (
          <Empty>No messages yet.</Empty>
        ) : (
          <div style={{ border: "1px solid var(--rule)" }}>
            {recentMessages.map((m) => (
              <Link
                key={m.id}
                href="/admin/messages"
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  gap: 16,
                  padding: "14px 18px",
                  borderBottom: "1px solid var(--rule)",
                  color: "var(--fg)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 11,
                    color: m.read ? "var(--muted)" : "var(--accent)",
                  }}
                >
                  {m.read ? "·" : "●"}
                </span>
                <span
                  style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  <strong style={{ fontWeight: 500 }}>{m.name}</strong> · {m.email} ·{" "}
                  <span style={{ color: "var(--muted)" }}>{m.subject ?? "(no subject)"}</span>
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 11,
                    color: "var(--muted)",
                  }}
                >
                  {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
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
            fontFamily: "var(--font-inter)",
            fontSize: 14,
            color: "var(--muted)",
            marginTop: 8,
          }}
        >
          {subtitle}
        </div>
      )}
    </header>
  );
}

function Stat({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "20px 24px",
        border: "1px solid var(--rule)",
        background: "var(--bg)",
        color: "var(--fg)",
        transition: "border-color 200ms",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 10,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-space-grotesk)",
          fontWeight: 300,
          fontSize: 44,
          letterSpacing: "-0.02em",
          color: highlight ? "var(--accent)" : "var(--fg)",
        }}
      >
        {String(value).padStart(2, "0")}
      </div>
    </Link>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "32px 24px",
        border: "1px dashed var(--rule)",
        color: "var(--muted)",
        fontFamily: "var(--font-jetbrains-mono)",
        fontSize: 12,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}

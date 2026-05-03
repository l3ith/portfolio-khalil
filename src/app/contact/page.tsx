import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/public/ContactForm";

export const dynamic = "force-dynamic";

async function sendMessage(name: string, email: string, message: string) {
  "use server";
  if (!name.trim() || !email.trim() || !message.trim()) return;
  await db.message.create({ data: { name: name.trim(), email: email.trim(), body: message.trim() } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export default async function ContactPage() {
  const s = await db.setting.findFirst({
    select: {
      email: true,
      phone1: true,
      phone2: true,
      behanceUrl: true,
      instagramUrl: true,
      linkedinUrl: true,
    },
  });

  type Row = { label: string; value: string; href?: string; icon?: React.ReactNode };
  const rows: Row[] = [];

  if (s?.email) {
    rows.push({ label: "Email", value: s.email, href: `mailto:${s.email}` });
  }
  if (s?.phone1) {
    rows.push({ label: "Phone", value: s.phone1, href: `tel:${s.phone1.replace(/\s/g, "")}` });
  }
  if (s?.phone2) {
    rows.push({ label: "Phone", value: s.phone2, href: `tel:${s.phone2.replace(/\s/g, "")}` });
  }
  if (s?.behanceUrl) {
    rows.push({ label: "Behance", value: s.behanceUrl, href: s.behanceUrl, icon: <BehanceIcon /> });
  }
  if (s?.instagramUrl) {
    rows.push({ label: "Instagram", value: s.instagramUrl, href: s.instagramUrl, icon: <InstagramIcon /> });
  }
  if (s?.linkedinUrl) {
    rows.push({ label: "LinkedIn", value: s.linkedinUrl, href: s.linkedinUrl, icon: <LinkedInIcon /> });
  }

  return (
    <article
      data-screen-label="05 Contact"
      data-header-theme="light"
      style={{ background: "var(--bg)", color: "var(--fg)", paddingTop: 64, minHeight: "100vh" }}
    >
      <div style={{ padding: "64px 24px 24px", borderBottom: "1px solid var(--rule)" }}>
        <div className="smallcaps" style={{ color: "var(--muted)", marginBottom: 16 }}>
          · 04 · Open Channel
        </div>
        <h1
          className="display"
          style={{ fontSize: "clamp(56px, 12vw, 200px)", margin: 0, fontWeight: 300 }}
        >
          Contact
        </h1>
      </div>

      <section
        className="contact-grid"
        style={{
          padding: "80px 24px 96px",
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1.2fr)",
          gap: 80,
          alignItems: "start",
        }}
      >
        <div>
          <p className="body-text" style={{ fontSize: 19, fontWeight: 300, marginTop: 0 }}>
            For commissions, exhibitions, press inquiries and conversations about future work,
            write below or reach the studio directly.
          </p>

          {rows.length > 0 && (
            <div style={{ marginTop: 48, borderTop: "1px solid var(--rule)" }}>
              {rows.map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 1fr",
                    padding: "16px 0",
                    borderBottom: "1px solid var(--rule)",
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: 15,
                    fontWeight: 300,
                    alignItems: "center",
                  }}
                >
                  <span className="smallcaps" style={{ color: "var(--muted)" }}>
                    {row.label}
                  </span>
                  {row.href ? (
                    <a
                      href={row.href}
                      target={row.href.startsWith("http") ? "_blank" : undefined}
                      rel={row.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        color: "var(--fg)",
                        textDecoration: "none",
                      }}
                    >
                      {row.icon}
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {row.href.startsWith("http")
                          ? row.value.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")
                          : row.value}
                      </span>
                    </a>
                  ) : (
                    <span>{row.value}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <ContactForm onSend={sendMessage} />
      </section>

      <style>{`
        @media (max-width: 880px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
      `}</style>

      <Footer />
    </article>
  );
}

function BehanceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 1.2.836 1.98 2.09 1.98.618 0 1.101-.292 1.387-.764zm-7.777-3.4h4.965c-.125-1.08-.82-1.96-2.39-1.96-1.463 0-2.315.88-2.575 1.96zM6.003 11.5c0 1.094-.826 1.5-1.826 1.5H2V10h2.19c.906 0 1.813.333 1.813 1.5zM2 14.5h2.5c1.21 0 2.003.545 2.003 1.792C6.503 17.698 5.541 18 4.291 18H2v-3.5zM0 8h4.5c2.377 0 4.003 1.32 4.003 3.5 0 1.196-.5 2.118-1.5 2.747C8.247 14.667 9 15.875 9 17.292 9 19.667 7.376 21 5.003 21H0V8z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";

type Form = { name: string; email: string; message: string };

export default function ContactPage() {
  const [form, setForm] = useState<Form>({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Partial<Form>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Partial<Form> = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Invalid email";
    if (!form.message.trim() || form.message.length < 10) errs.message = "10 chars min";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSent(true);
  };

  return (
    <article
      data-screen-label="05 Contact"
      data-header-theme="light"
      style={{ background: "var(--bg)", color: "var(--fg)", paddingTop: 64, minHeight: "100vh" }}
    >
      <div style={{ padding: "64px 24px 24px", borderBottom: "1px solid var(--rule)" }}>
        <div className="smallcaps" style={{ color: "var(--muted)", marginBottom: 16 }}>
          · 03 · Open Channel
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
          <div
            style={{
              marginTop: 48,
              display: "grid",
              gap: 0,
              borderTop: "1px solid var(--rule)",
            }}
          >
            {[
              ["Studio", "studio@khalil.design"],
              ["Agent · EMEA", "office@field-rep.com"],
              ["Agent · Americas", "atelier@hyphen.la"],
              ["Atelier", "Paris · 11ᵉ — by appointment"],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr",
                  padding: "16px 0",
                  borderBottom: "1px solid var(--rule)",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 15,
                  fontWeight: 300,
                }}
              >
                <span className="smallcaps" style={{ color: "var(--muted)" }}>
                  {k}
                </span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit}>
          {sent ? (
            <div
              style={{
                border: "1px solid var(--accent)",
                background: "var(--accent)",
                color: "#0a0a0a",
                padding: 32,
              }}
            >
              <div className="smallcaps" style={{ marginBottom: 12 }}>
                · Channel Open · 200 OK
              </div>
              <div
                style={{
                  fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
                  fontWeight: 300,
                  fontSize: 28,
                  letterSpacing: "-0.01em",
                  textTransform: "uppercase",
                  lineHeight: 1.1,
                }}
              >
                Message received, {form.name.split(" ")[0]}.
              </div>
              <div
                className="body-text"
                style={{ fontSize: 15, marginTop: 12, color: "rgba(10,10,10,0.7)" }}
              >
                The studio replies within 48 hours, weekdays. Out-of-office returns are flagged in
                an auto-reply.
              </div>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setForm({ name: "", email: "", message: "" });
                }}
                style={{
                  marginTop: 24,
                  fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  padding: "10px 14px",
                  border: "1px solid #0a0a0a",
                  color: "#0a0a0a",
                  background: "transparent",
                }}
              >
                Send Another →
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <Field
                label="Name"
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                error={errors.name}
                index="A1"
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                error={errors.email}
                index="A2"
              />
              <Field
                label="Message"
                multiline
                value={form.message}
                onChange={(v) => setForm((f) => ({ ...f, message: v }))}
                error={errors.message}
                index="A3"
              />
              <button
                type="submit"
                data-cursor="SEND"
                style={{
                  alignSelf: "flex-start",
                  marginTop: 8,
                  fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
                  fontSize: 12,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  padding: "16px 24px",
                  background: "var(--fg)",
                  color: "var(--bg)",
                  border: "1px solid var(--fg)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "background 320ms, color 320ms",
                }}
              >
                Transmit →
              </button>
            </div>
          )}
        </form>
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

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  multiline?: boolean;
  type?: string;
  index: string;
};

function Field({ label, value, onChange, error, multiline, type = "text", index }: FieldProps) {
  const [focus, setFocus] = useState(false);
  const baseStyle = {
    width: "100%",
    padding: "16px 18px",
    background: "rgba(10,10,10,0.04)",
    border: "1px solid",
    borderColor: error ? "#d92020" : focus ? "var(--fg)" : "transparent",
    color: "var(--fg)",
    fontFamily: "var(--font-inter), Inter, sans-serif",
    fontSize: 16,
    fontWeight: 300,
    outline: "none",
    transition: "border-color 320ms, background 320ms",
    borderRadius: 0,
  };

  return (
    <label style={{ display: "block" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span className="smallcaps" style={{ color: error ? "#d92020" : "var(--muted)" }}>
          {index} · {label} {error && `· ${error}`}
        </span>
        <span
          className="mono"
          style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.2em" }}
        >
          {String(value.length).padStart(3, "0")}
        </span>
      </div>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          rows={6}
          style={{ ...baseStyle, resize: "vertical" }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={baseStyle}
        />
      )}
    </label>
  );
}

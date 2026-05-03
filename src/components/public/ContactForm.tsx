"use client";

import { useState } from "react";

type Form = { name: string; email: string; message: string };

export function ContactForm({ onSend }: { onSend?: (name: string, email: string, message: string) => Promise<void> }) {
  const [form, setForm] = useState<Form>({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Partial<Form>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Partial<Form> = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Invalid email";
    if (!form.message.trim() || form.message.length < 10) errs.message = "10 chars min";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await onSend?.(form.name, form.email, form.message);
    } finally {
      setBusy(false);
    }
    setSent(true);
  };

  if (sent) {
    return (
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
          The studio replies within 48 hours, weekdays.
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
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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
        disabled={busy}
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
        {busy ? "Sending…" : "Transmit →"}
      </button>
    </form>
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
        <span className="mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.2em" }}>
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

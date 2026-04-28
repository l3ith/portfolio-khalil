import { redirect } from "next/navigation";
import { checkCredentials, signSession, setSessionCookie, getSession } from "@/lib/auth";

export const metadata = { title: "Admin · Login" };

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");
  if (!checkCredentials(email, password)) {
    redirect(`/admin/login?error=invalid&from=${encodeURIComponent(from)}`);
  }
  const token = await signSession(email);
  await setSessionCookie(token);
  redirect(from && from.startsWith("/admin") ? from : "/admin");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/admin");
  const sp = await searchParams;
  const error = sp.error;
  const from = sp.from ?? "/admin";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--fg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
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
          · Admin · Sign in
        </div>
        <h1
          style={{
            fontFamily: "var(--font-space-grotesk)",
            fontWeight: 300,
            fontSize: 56,
            letterSpacing: "-0.02em",
            lineHeight: 0.95,
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          KHALIL
          <br />
          <span style={{ color: "var(--accent)" }}>Studio.</span>
        </h1>

        <form
          action={loginAction}
          style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 18 }}
        >
          <input type="hidden" name="from" value={from} />
          <Field name="email" label="Email" type="email" />
          <Field name="password" label="Password" type="password" />
          {error === "invalid" && (
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#d92020",
              }}
            >
              · Invalid credentials
            </div>
          )}
          <button
            type="submit"
            style={{
              alignSelf: "flex-start",
              marginTop: 8,
              padding: "14px 22px",
              background: "var(--fg)",
              color: "var(--bg)",
              border: "1px solid var(--fg)",
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 12,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            Open Console →
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ name, label, type }: { name: string; label: string; type: string }) {
  return (
    <label style={{ display: "block" }}>
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 10,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <input
        name={name}
        type={type}
        required
        autoComplete={type === "password" ? "current-password" : "email"}
        style={{
          width: "100%",
          padding: "14px 16px",
          background: "rgba(10,10,10,0.04)",
          border: "1px solid var(--rule)",
          color: "var(--fg)",
          fontFamily: "var(--font-inter)",
          fontSize: 16,
          fontWeight: 300,
          outline: "none",
          borderRadius: 0,
        }}
      />
    </label>
  );
}

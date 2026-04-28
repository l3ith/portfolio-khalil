import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { adminButtonStyle, adminPageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

async function toggleRead(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const read = formData.get("read") === "true";
  await db.message.update({ where: { id }, data: { read } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

async function deleteMessage(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await db.message.delete({ where: { id } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

async function markAllRead() {
  "use server";
  await db.message.updateMany({ where: { read: false }, data: { read: true } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export default async function MessagesPage() {
  const messages = await db.message.findMany({ orderBy: { createdAt: "desc" } });
  const unread = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        {adminPageHeader("Messages", `${messages.length} total · ${unread} unread`)}
        {unread > 0 && (
          <form action={markAllRead}>
            <button
              type="submit"
              style={{
                ...adminButtonStyle,
                background: "transparent",
                color: "var(--fg)",
              }}
            >
              Mark all as read
            </button>
          </form>
        )}
      </div>

      {messages.length === 0 ? (
        <div
          style={{
            marginTop: 40,
            padding: 32,
            border: "1px dashed var(--rule)",
            textAlign: "center",
            color: "var(--muted)",
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          No messages yet.
        </div>
      ) : (
        <div style={{ marginTop: 32 }}>
          {messages.map((m, i) => (
            <div
              key={m.id}
              style={{
                border: "1px solid var(--rule)",
                borderTop: i === 0 ? "1px solid var(--rule)" : "none",
                padding: 20,
                background: m.read ? "var(--bg)" : "rgba(0,0,0,0.02)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto auto",
                  gap: 16,
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 12,
                    color: m.read ? "var(--muted)" : "var(--accent)",
                  }}
                  aria-label={m.read ? "Read" : "Unread"}
                >
                  {m.read ? "·" : "●"}
                </span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 15 }}>
                    {m.name}{" "}
                    <span style={{ color: "var(--muted)", fontWeight: 300, fontSize: 13 }}>
                      · {m.email}
                    </span>
                  </div>
                  {m.subject && (
                    <div
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: 11,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "var(--muted)",
                        marginTop: 4,
                      }}
                    >
                      {m.subject}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 11,
                    color: "var(--muted)",
                  }}
                >
                  {new Date(m.createdAt).toLocaleString()}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <form action={toggleRead}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="read" value={m.read ? "false" : "true"} />
                    <button
                      type="submit"
                      style={{
                        ...adminButtonStyle,
                        background: "transparent",
                        color: "var(--fg)",
                        padding: "6px 10px",
                        fontSize: 10,
                      }}
                    >
                      Mark {m.read ? "unread" : "read"}
                    </button>
                  </form>
                  <form action={deleteMessage}>
                    <input type="hidden" name="id" value={m.id} />
                    <button
                      type="submit"
                      style={{
                        ...adminButtonStyle,
                        background: "transparent",
                        color: "#d92020",
                        borderColor: "#d92020",
                        padding: "6px 10px",
                        fontSize: 10,
                      }}
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 14,
                  fontWeight: 300,
                  lineHeight: 1.65,
                  color: "var(--fg)",
                  whiteSpace: "pre-wrap",
                  paddingLeft: 30,
                }}
              >
                {m.body}
              </div>
              <div style={{ marginTop: 12, paddingLeft: 30 }}>
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject ?? ""))}`}
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                  }}
                >
                  Reply ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { translate } from "@vitalets/google-translate-api";

type Lang = "fr" | "en";

export async function translateText(
  text: string,
  to: Lang,
  from: Lang = to === "fr" ? "en" : "fr",
): Promise<string> {
  if (!text || !text.trim()) return text;
  try {
    const res = await translate(text, { from, to });
    return res.text || text;
  } catch (e) {
    console.error("[translate]", e instanceof Error ? e.message : e);
    return text;
  }
}

export async function autoFr(en: string, fr?: string | null): Promise<string> {
  const provided = (fr ?? "").trim();
  if (provided) return provided;
  if (!en?.trim()) return en ?? "";
  return translateText(en, "fr", "en");
}

export async function autoEn(fr: string, en?: string | null): Promise<string> {
  const provided = (en ?? "").trim();
  if (provided) return provided;
  if (!fr?.trim()) return fr ?? "";
  return translateText(fr, "en", "fr");
}

import { cookies } from "next/headers";

export type Lang = "en" | "fr";
export const LANG_COOKIE = "lang";

export async function getLang(): Promise<Lang> {
  const c = await cookies();
  const v = c.get(LANG_COOKIE)?.value;
  return v === "fr" ? "fr" : "en";
}

export function pick<T>(lang: Lang, en: T, fr: T): T {
  return lang === "fr" ? fr : en;
}

import type { Metadata } from "next";
import { PublicChrome } from "@/components/PublicChrome";
import { getActiveTheme, themeToCss, googleFontsUrl } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "KHALIL — Automotive Designer / Portfolio",
  description:
    "Portfolio of Khalil — automotive designer working between concept, production and screen.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const theme = await getActiveTheme();
  return (
    <html lang="en" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={googleFontsUrl(theme)} />
        <style dangerouslySetInnerHTML={{ __html: themeToCss(theme) }} />
      </head>
      <body>
        <PublicChrome>{children}</PublicChrome>
      </body>
    </html>
  );
}

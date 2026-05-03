"use client";

import { usePathname } from "next/navigation";
import { DriftCursor } from "@/components/DriftCursor";
import { Header } from "@/components/Header";

export function PublicChrome({
  children,
  logoUrl,
  logoHeight,
  logoText,
  logoTextFont,
  logoTextColor,
}: {
  children: React.ReactNode;
  logoUrl?: string | null;
  logoHeight?: number;
  logoText?: string;
  logoTextFont?: string;
  logoTextColor?: string;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <DriftCursor />
      <Header
        logoUrl={logoUrl ?? null}
        logoHeight={logoHeight ?? 28}
        logoText={logoText ?? "KHALIL"}
        logoTextFont={logoTextFont ?? "Space Grotesk"}
        logoTextColor={logoTextColor ?? ""}
      />
      <main className="fade-in">{children}</main>
    </>
  );
}

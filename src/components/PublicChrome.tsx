"use client";

import { usePathname } from "next/navigation";
import { DriftCursor } from "@/components/DriftCursor";
import { Header } from "@/components/Header";

export function PublicChrome({
  children,
  logoUrl,
  logoHeight,
}: {
  children: React.ReactNode;
  logoUrl?: string | null;
  logoHeight?: number;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  const isHome = pathname === "/";

  return (
    <>
      <DriftCursor />
      {!isHome && <Header logoUrl={logoUrl ?? null} logoHeight={logoHeight ?? 28} />}
      <main className="fade-in">{children}</main>
    </>
  );
}

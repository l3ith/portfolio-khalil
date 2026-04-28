"use client";

import { usePathname } from "next/navigation";
import { DriftCursor } from "@/components/DriftCursor";
import { Header } from "@/components/Header";

export function PublicChrome({
  children,
  logoUrl,
}: {
  children: React.ReactNode;
  logoUrl?: string | null;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <DriftCursor />
      <Header logoUrl={logoUrl ?? null} />
      <main className="fade-in">{children}</main>
    </>
  );
}

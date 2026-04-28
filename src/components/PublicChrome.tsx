"use client";

import { usePathname } from "next/navigation";
import { DriftCursor } from "@/components/DriftCursor";
import { Header } from "@/components/Header";

export function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <DriftCursor />
      <Header />
      <main className="fade-in">{children}</main>
    </>
  );
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getObject } from "@/lib/r2";
import { isCompressible, storeOptimized } from "@/lib/media-store";

// Adaptive compression runs several encodes on large images
export const maxDuration = 60;

const Body = z.object({ key: z.string().regex(/^originals\/[\w.-]+$/) });

// Step 2 of an image upload: compress the original and return the URL to store.
export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid key" }, { status: 400 });
  }
  try {
    const { data, contentType } = await getObject(parsed.data.key);
    if (!isCompressible(contentType)) {
      return NextResponse.json({ error: "not a compressible image" }, { status: 400 });
    }
    const { url, optimized } = await storeOptimized(data, contentType, parsed.data.key);
    return NextResponse.json({
      url,
      originalBytes: data.length,
      bytes: optimized?.data.length ?? data.length,
      quality: optimized?.quality ?? null,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "processing failed" },
      { status: 500 },
    );
  }
}

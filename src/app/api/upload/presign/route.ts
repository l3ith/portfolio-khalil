import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { newKey, presignPut, publicUrl } from "@/lib/r2";
import { ALLOWED_TYPES, MAX_UPLOAD_BYTES, isCompressible } from "@/lib/media-store";

const Body = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string(),
  size: z.number().int().positive(),
});

// Step 1 of an upload: the browser gets a signed URL and PUTs the raw file to R2.
// Compressible images land in originals/ and need step 2 (/api/upload/process).
export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
  const { filename, contentType, size } = parsed.data;
  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: `type not allowed: ${contentType}` }, { status: 400 });
  }
  if (size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "file too large (max 200 MB)" }, { status: 400 });
  }

  const needsProcessing = isCompressible(contentType);
  const key = newKey(needsProcessing ? "originals" : "media", filename);
  return NextResponse.json({
    uploadUrl: await presignPut(key, contentType),
    key,
    url: publicUrl(key),
    needsProcessing,
  });
}

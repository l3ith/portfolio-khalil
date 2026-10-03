// Browser-side upload to Cloudflare R2: presign → direct PUT → server-side compression.

const EXT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mkv: "video/x-matroska",
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `${url} failed (${res.status})`);
  return json as T;
}

export type UploadStage = "uploading" | "optimizing";

export async function uploadFile(file: File, onStage?: (stage: UploadStage) => void): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const contentType = file.type || EXT_TYPES[ext] || "application/octet-stream";

  onStage?.("uploading");
  const presign = await postJson<{ uploadUrl: string; key: string; url: string; needsProcessing: boolean }>(
    "/api/upload/presign",
    { filename: file.name, contentType, size: file.size },
  );
  const put = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!put.ok) throw new Error(`Upload to storage failed (${put.status})`);
  if (!presign.needsProcessing) return presign.url;

  onStage?.("optimizing");
  const processed = await postJson<{ url: string }>("/api/upload/process", { key: presign.key });
  return processed.url;
}

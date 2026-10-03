import { randomUUID } from "node:crypto";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | null = null;

function r2() {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
      },
    });
  }
  return client;
}

const bucket = () => process.env.R2_BUCKET ?? "";

export function publicUrl(key: string) {
  return `${(process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "")}/${key}`;
}

export function isR2Url(url: string) {
  const base = process.env.R2_PUBLIC_URL;
  return !!base && url.startsWith(base);
}

/** `prefix/<uuid>-<slugified-name>.<ext>` */
export function newKey(prefix: string, filename: string, ext?: string) {
  const dot = filename.lastIndexOf(".");
  const stem =
    (dot > 0 ? filename.slice(0, dot) : filename)
      .normalize("NFKD")
      .replace(/[^\w-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 60) || "file";
  const extension = (ext ?? (dot > 0 ? filename.slice(dot + 1) : "bin")).toLowerCase();
  return `${prefix}/${randomUUID()}-${stem}.${extension}`;
}

export async function putObject(key: string, body: Buffer, contentType: string) {
  await r2().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
      // Keys are unique (uuid), so a file never changes: cache forever
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

export async function getObject(key: string) {
  const res = await r2().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
  const bytes = await res.Body!.transformToByteArray();
  return { data: Buffer.from(bytes), contentType: res.ContentType ?? "application/octet-stream" };
}

/** Signed URL the browser PUTs the raw file to (bypasses the serverless body limit). */
export async function presignPut(key: string, contentType: string) {
  return await getSignedUrl(
    r2(),
    new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: contentType }),
    { expiresIn: 600 },
  );
}

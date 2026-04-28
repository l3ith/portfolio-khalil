import path from "node:path";
import { defineConfig } from "prisma/config";

if (!process.env.VERCEL) {
  await import("dotenv/config");
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: (process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL)!,
  },
});

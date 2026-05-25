import "dotenv/config"
import { defineConfig, env } from "prisma/config"

const url = env("DATABASE_URL")
const isSqlite = url.startsWith("file:")

export default defineConfig({
  schema: isSqlite ? "prisma/schema.sqlite.prisma" : "prisma/schema.prisma",
  datasource: {
    url,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
})

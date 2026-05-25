<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:prisma7-rules -->
# Prisma 7 — Major Breaking Changes from Prisma 6

1. NO `url` in schema file — remove `url` from `datasource db {}` block.
2. Create `prisma.config.ts` at project root with `defineConfig` from `prisma/config`:
   ```ts
   import "dotenv/config"
   import { defineConfig, env } from "prisma/config"
   export default defineConfig({
     schema: "prisma/schema.prisma",
     datasource: { url: env("DATABASE_URL") },
   })
   ```
3. **Driver adapter required** — `new PrismaClient()` without `adapter` throws. For SQLite:
   ```ts
   import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
   import { PrismaClient } from "@prisma/client"
   const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! })
   const prisma = new PrismaClient({ adapter })
   ```
4. Install `@prisma/adapter-better-sqlite3` + `better-sqlite3` + `@types/better-sqlite3` for SQLite.
5. Run `npx prisma generate` then `npx prisma db push`.
6. Seed script uses `tsx prisma/seed.ts` — must install `tsx` as dev dep.
7. Prisma 7 generates client to `node_modules/@prisma/client` as before.
<!-- END:prisma7-rules -->

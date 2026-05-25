import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function createPrismaClient() {
  const url = process.env.DATABASE_URL

  if (!url) {
    return new PrismaClient()
  }

  if (url.startsWith("file:")) {
    const { PrismaBetterSqlite3 }: typeof import("@prisma/adapter-better-sqlite3") = require("@prisma/adapter-better-sqlite3")
    const adapter = new PrismaBetterSqlite3({ url })
    return new PrismaClient({ adapter })
  } else {
    const { Pool }: typeof import("pg") = require("pg")
    const { PrismaPg }: typeof import("@prisma/adapter-pg") = require("@prisma/adapter-pg")
    const isSsl = url.includes("sslmode=require") || url.includes("ssl=true")
    const pool = new Pool({ 
      connectionString: url, 
      ssl: isSsl ? { rejectUnauthorized: false } : undefined 
    })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

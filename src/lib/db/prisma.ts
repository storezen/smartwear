import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function createPrismaClient() {
  const url = process.env.DATABASE_URL
  
  if (!url) {
    // Return a dummy client during build if DB is missing to prevent Next.js build errors
    return new PrismaClient()
  }

  const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

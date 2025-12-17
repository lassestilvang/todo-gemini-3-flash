import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const dbPath = process.env.DATABASE_URL 
    ? process.env.DATABASE_URL.replace("file:", "") 
    : "dev.db"

const createPrismaClient = () => {
    // We need to resolve path correctly if it is relative
    const resolvedPath = path.resolve(process.cwd(), dbPath)
    
    // The adapter creates the DB instance now?
    const adapter = new PrismaBetterSqlite3({ url: resolvedPath })
    return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
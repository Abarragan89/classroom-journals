// import { Pool, neonConfig } from '@neondatabase/serverless'
// import { PrismaNeon } from '@prisma/adapter-neon'
// import { PrismaClient } from '@prisma/client'
// import ws from 'ws'

// neonConfig.webSocketConstructor = ws
// const connectionString = `${process.env.DATABASE_URL}`

// const pool = new Pool({ connectionString })
// const adapter = new PrismaNeon(pool)
// export const prisma = new PrismaClient({ adapter })


// lib/db.ts (or wherever your DB connection is set up)
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL!

declare global {
    var prisma: PrismaClient | undefined
}


let prisma: PrismaClient

if (!globalThis.prisma) {
    const pool = new Pool({ connectionString })
    const adapter = new PrismaNeon(pool)
    prisma = new PrismaClient({ adapter })
    globalThis.prisma = prisma
} else {
    prisma = globalThis.prisma
}

export { prisma }

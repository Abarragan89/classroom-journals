import { Redis } from 'ioredis'

export const connection = new Redis({
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD || '',
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
})
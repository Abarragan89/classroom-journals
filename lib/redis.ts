import { Redis } from 'ioredis'

export const connection = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(6379),
    maxRetriesPerRequest: null,
})
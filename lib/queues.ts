import { Queue, QueueEvents } from 'bullmq'
import { connection } from './redis'

export const openAiQueue = new Queue('openai', {
    connection,
})

export const openAiQueueEvents = new QueueEvents('openai', {
    connection,
})
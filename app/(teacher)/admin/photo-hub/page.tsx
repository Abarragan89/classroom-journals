import { auth } from '@/auth'
import { Session } from '@/types'
import { notFound } from 'next/navigation'
import PhotoHubClient from './photo-hub-client'
import AIIntegration from './ai-integration'

export default async function PhotoHub() {
    const session = await auth() as Session

    if (!session) return notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId || session?.user?.role !== 'ADMIN') return notFound()

    return (
        <main className='wrapper'>
            <h1 className='h1-bold'>Photo Hub</h1>
            <PhotoHubClient />
            <AIIntegration />
        </main>
    )
}

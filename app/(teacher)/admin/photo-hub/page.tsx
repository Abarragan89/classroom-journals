import { auth } from '@/auth'
import { prisma } from '@/db/prisma'
import { Session } from '@/types'
import { notFound } from 'next/navigation'
import React from 'react'

export default async function PhotoHub() {
    const session = await auth() as Session

    if (!session) notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId || session?.user?.role !== 'TEACHER') return notFound()

    const isAdmin = await prisma.user.findUnique({
        where: { id: teacherId },
        select: { isAdmin: true }
    })

    if (!isAdmin?.isAdmin) return notFound();

    return (
        <div>PhotoHub</div>
    )
}

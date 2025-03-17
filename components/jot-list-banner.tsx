import { PromptSession } from '@/types'
import { formatDateShort } from '@/lib/utils'
import { Question } from '@/types'
import Link from 'next/link'

export default function JotListBanner({
    jotData,
    classId,
    teacherId,
}: {
    jotData: PromptSession,
    classId: string,
    teacherId: string
}) {

    return (
        <Link className='max-w-[500px]' href={`/classroom/${classId}/${teacherId}/single-prompt-session/${jotData.id}`}>
            <article className='bg-card opacity-80 text-card-foreground px-5 py-2 rounded-lg mt-3 mb-4 border border-border hover:cursor-pointer hover:opacity-100'>
                <div className="flex-between text-xs">
                    <p>Status: {jotData.status}</p>
                    <p>Posted: {formatDateShort(jotData.createdAt)}</p>
                </div>
                <p className='text-md py-2 font-bold'>{jotData.title}</p>
                <div className="flex-between text-xs">
                    <p>Submissions: 3/12</p>
                    <p>Questions: {(jotData.questions as Question[])?.length}</p>
                </div>
            </article>
        </Link>
    )
}

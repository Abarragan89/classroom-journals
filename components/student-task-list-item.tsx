import { PromptSession } from '@/types'
import { JsonArray } from '@prisma/client/runtime/library'
import Link from 'next/link'

export default function StudentTaskListItem({ jotData }: { jotData: PromptSession }) {

    const questionCount = jotData?.questions as unknown as JsonArray

    return (
        <Link href={`/jot-response/${jotData.id}?q=0`}>
            <article className='bg-card opacity-80 text-card-foreground px-5 py-2 rounded-lg mt-3 mb-4 border border-border hover:cursor-pointer hover:opacity-100'>
                <p className='text-md py-3 font-bold'>{jotData.title}</p>
                <div className="flex-between text-xs">
                    <p>Questions: {questionCount.length}</p>
                    <p>Status: <span className='text-destructive'>incomplete</span></p>
                </div>
            </article>
        </Link>
    )
}

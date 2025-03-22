import { PromptSession } from '@/types'
import { JsonArray } from '@prisma/client/runtime/library'
import Link from 'next/link'

export default function StudentTaskListItem({ jotData }: { jotData: PromptSession }) {

    const questionCount = jotData?.questions as unknown as JsonArray

    return (
        <Link href={`/jot-response/${jotData.id}?q=0`}>
            <article className='bg-card w-[350px] h-[150px] opacity-80 text-card-foreground px-5 py-2 rounded-lg border border-border hover:cursor-pointer hover:opacity-100'>
                <div className="flex-between text-xs">
                    {jotData.promptType === 'multi-question' ?
                        <p>Questions: {questionCount.length}</p>
                        :
                        <p>Blog Prompt</p>
                    }
                    <p>Status: <span className='text-destructive'>incomplete</span></p>
                </div>
                <p className='text-md pt-2 font-bold line-clamp-4'>{jotData.title}</p>
            </article>
        </Link>
    )
}

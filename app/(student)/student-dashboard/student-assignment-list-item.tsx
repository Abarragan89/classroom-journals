import { PromptSession } from '@/types'
import { formatDateLong } from '@/lib/utils'
import Link from 'next/link'

export default function StudentAssignmentListItem({
    jotData,
}: {
    jotData: PromptSession,
}) {

    const type = jotData.promptType === 'multi-question' ? 'Assessment' : 'Blog';
    const hrefLink = jotData?.studentResponseId ? `response-review/${jotData?.studentResponseId}` : `/jot-response/${jotData.id}?q=0`

    return (
        <div className='relative'>
            <Link className='block relative' href={hrefLink}>
                {/* only show public or private if it is a blog, otherwise don't render */}
                <article className='bg-card flex-start opacity-80 px-5 py-4 rounded-lg mb-4 border border-border hover:cursor-pointer hover:opacity-100'>
                    <p
                        className='text-2xl font-bold bg-input text-background p-1 px-3 rounded-full mr-3'
                    >
                        {type.charAt(0)}
                    </p>
                    <div className="flex flex-col relative w-full">
                        <p className='text-md font-bold line-clamp-1 text-foreground'>{jotData.title}</p>
                        <div className="relative top-[11px] w-full flex-between text-xs text-input">
                            <p>{formatDateLong(jotData.createdAt, 'short')}</p>
                            {jotData.isCompleted ?
                                jotData.isSubmittable ? (
                                    <p>Status: <span className={`font-bold pr-2 text-warning`}>Returned</span></p>
                                )
                                    : (
                                        <p>Status: <span className={`font-bold pr-2 text-success`}>Completed</span></p>
                                    ) : (
                                    <p>Status: <span className={`font-bold pr-2 text-destructive`}>Incomplete</span></p>
                                )}
                        </div>
                    </div>
                </article>
            </Link>
            <div className="text-xs absolute text-input right-3 bottom-[6px]">
            </div>
        </div >
    )
}
// {jotData.promptType === 'multi-question' && (
//     <QuestionPopup promptQuestions={jotData as unknown as Prompt} />
// )}

// : (
//     jotData.isPublic && jotData.promptType === 'single-question' ? (
//         <p>Status: <span className={`font-bold pr-2 ${jotData.status === 'open' ? 'text-success' : 'text-destructive'}`}>{jotData.status}</span></p>
//     ) : (
//         <p>Private</p>
//     )
//     )
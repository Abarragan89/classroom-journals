import { Prompt, PromptSession } from '@/types'
import { formatDateLong } from '@/lib/utils'
import Link from 'next/link'
import QuestionPopup from './shared/prompt-card/question-popup'

export default function JotListBanner({
    jotData,
    classId,
    teacherId,
    studentId,
    classSize
}: {
    jotData: PromptSession,
    classId: string,
    studentId?: string,
    teacherId?: string,
    classSize?: number
}) {

    const type = jotData.promptType === 'multi-question' ? 'Multi-Question' : 'Blog Prompt';

    return (
        <div>
            {teacherId ? (
                <div className='relative w-[350px] h-[150px]'>
                    <Link className='block h-[150px]' href={`/classroom/${classId}/${teacherId}/single-prompt-session/${jotData.id}`}>
                        <article className='bg-card h-[150px] flex flex-col justify-between opacity-80 px-4 py-3 rounded-lg mt-3 mb-4 border border-border hover:cursor-pointer hover:opacity-100'>
                            <div className="flex-between text-xs">
                                <p>{type}</p>
                                <p>{formatDateLong(jotData.createdAt)}</p>
                            </div>
                            <p className='text-sm font-bold line-clamp-3 text-foreground'>{jotData.title}</p>
                            <div className="flex-between text-xs">
                                <p>Submissions: {jotData?.responses?.length} / {classSize}</p>
                            </div>
                        </article>
                    </Link>
                    <div className="text-xs absolute text-card-foreground right-3 bottom-3">
                        {jotData.promptType === 'multi-question' ? (
                            <QuestionPopup promptQuestions={jotData as unknown as Prompt} />
                        ) : (
                            <p>Status: <span className="text-success">{jotData.status}</span></p>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <Link className='block' href={`/discussion-board/${studentId}/${jotData.id}/response/${jotData.responses?.[0].id}`}>
                        <article className='w-[250px] h-[150px] flex flex-col justify-between bg-card opacity-80 rounded-lg hover:cursor-pointer hover:opacity-100'>
                            <div className="flex-between text-xs">
                                <p>World History</p>
                                <p>{formatDateLong(jotData.createdAt)}</p>
                            </div>
                            <p className='text-sm font-bold line-clamp-3 text-foreground'>{jotData.title}</p>
                            <div className="flex-between text-xs ">
                                <p>Submissions: {jotData?.responses?.length} / {classSize}</p>
                                <p>Status: <span className="text-success">{jotData.status}</span></p>
                            </div>
                        </article>
                    </Link>
                </>
            )}
        </div>
    )
}

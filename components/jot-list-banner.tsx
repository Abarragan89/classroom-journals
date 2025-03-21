import { Prompt, PromptSession } from '@/types'
import { formatDateLong } from '@/lib/utils'
import { Question } from '@/types'
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

    console.log('jotdata', jotData)

    const type = jotData.promptType === 'multi-question' ? 'Multi-Question' : 'Journal Prompt'
    
    return (
        <div className='relative'>
            {teacherId ? (
                <>
                    <Link className='max-w-[500px]' href={`/classroom/${classId}/${teacherId}/single-prompt-session/${jotData.id}`}>
                        <article className='bg-card opacity-80 text-card-foreground px-5 py-2 rounded-lg mt-3 mb-4 border border-border hover:cursor-pointer hover:opacity-100'>
                            <div className="flex-between text-xs">
                                <p>{type}</p>
                                <p>{formatDateLong(jotData.createdAt)}</p>
                            </div>
                            <p className='text-sm py-5 font-bold'>{jotData.title}</p>
                            <div className="flex-between text-xs ">
                                <p>Submissions: {jotData?.responses?.length} / {classSize}</p>
                            </div>
                        </article>
                    </Link>
                    <div className="text-xs absolute right-3 bottom-3">
                        {jotData.promptType === 'multi-question' ? (
                            <QuestionPopup promptQuestions={jotData as unknown as Prompt} />
                        ) : (
                            <p>Status: <span className="text-success">{jotData.status}</span></p>
                        )
                        }
                    </div>
                </>
            ) : (
                <>
                    <Link className='max-w-[500px]' href={`/discussion-board/${studentId}/${jotData.id}`}>
                        <article className='bg-card opacity-80 text-card-foreground px-5 py-2 rounded-lg mt-3 mb-4 border border-border hover:cursor-pointer hover:opacity-100'>
                            <div className="flex-between text-xs">
                                <p>{type}</p>
                                <p>{formatDateLong(jotData.createdAt)}</p>
                            </div>
                            <p className='text-sm py-5 font-bold'>{jotData.title}</p>
                            <div className="flex-between text-xs ">
                                <p>Submissions: {jotData?.responses?.length} / {classSize}</p>
                            </div>
                        </article>
                    </Link>
                    <div className="text-xs absolute right-3 bottom-3">
                        {type === 'Multi-Question' ? (
                            <QuestionPopup promptQuestions={jotData as unknown as Prompt} />
                        ) : (
                            <p>Status: <span className="text-success">{jotData.status}</span></p>
                        )
                        }
                    </div>
                </>
            )}
        </div>
    )
}

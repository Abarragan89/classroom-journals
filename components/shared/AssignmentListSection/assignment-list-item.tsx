import { Prompt, PromptSession } from '@/types'
import { formatDateLong } from '@/lib/utils'
import Link from 'next/link'
import QuestionPopup from '../prompt-card/question-popup'
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export default function AssignmentListItem({
    jotData,
    classId,
    teacherId,
    classSize
}: {
    jotData: PromptSession,
    classId: string,
    teacherId?: string,
    classSize?: number
}) {

    const type = jotData.promptType === 'multi-question' ? 'Assessment' : 'Blog';

    return (
        <div className='relative'>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link className='block' href={`/classroom/${classId}/${teacherId}/single-prompt-session/${jotData.id}`}>
                            <article className='bg-card flex-start opacity-80 px-5 py-4 rounded-lg mb-4 border border-border hover:cursor-pointer hover:opacity-100'>
                                <p
                                    className='text-2xl bg-input p-2 px-4 rounded-full mr-3'
                                >
                                    {type.charAt(0)}
                                </p>
                                <div className="flex flex-col relative">
                                    <p className='text-sm font-bold line-clamp-1 text-foreground'>{jotData.title}</p>
                                    <div className="relative top-[11px] flex-between text-xs">
                                        <p>{formatDateLong(jotData.createdAt)}</p>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent className='min-w-[200px] space-y-1 p-2'>
                        <p className='text-center underline mb-2'>{type}</p>
                        <p><span className="font-bold">Category: </span> {jotData?.prompt?.category?.name ? jotData?.prompt?.category?.name : 'No Category'}</p>
                        <p><span className="font-bold">Submissions: </span>{jotData?.responses?.length} / {classSize}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <div className="text-xs absolute text-card-foreground right-3 bottom-3">
                {jotData.promptType === 'multi-question' ? (
                    <QuestionPopup promptQuestions={jotData as unknown as Prompt} />
                ) : (
                    <p>Discussion: <span className={`font-bold pr-2 ${jotData.status === 'open' ? 'text-success' : 'text-destructive'}`}>{jotData.status}</span></p>
                )}
            </div>
        </div>
    )
}

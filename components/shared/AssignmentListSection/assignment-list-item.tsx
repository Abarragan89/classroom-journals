import { Prompt, PromptSession } from '@/types'
import { formatDateLong } from '@/lib/utils'
import Link from 'next/link'
import QuestionPopup from '../prompt-card/question-popup'
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
                        <Link className='block relative' href={`/classroom/${classId}/${teacherId}/single-prompt-session/${jotData.id}`}>
                            {/* only show public or private if it is a blog, otherwise don't render */}
                            <article className='bg-card flex-start opacity-80 px-5 py-4 rounded-lg mb-4 border border-border hover:cursor-pointer hover:opacity-100'>
                                {/* <p
                                    className='absolute top-2 right-5 italic text-input text-xs'
                                >
                                    {jotData.isPublic && type === 'Blog' && 'public'}
                                    {!jotData.isPublic && type === 'Blog' && 'private'}
                                </p> */}
                                <p
                                    className='text-2xl bg-input p-2 px-4 rounded-full mr-3'
                                >
                                    {type.charAt(0)}
                                </p>
                                <div className="flex flex-col relative">
                                    <p className='text-md font-bold line-clamp-1 text-foreground'>{jotData.title}</p>
                                    <div className="relative top-[11px] flex-between text-xs text-input">
                                        <p>{formatDateLong(jotData.createdAt, 'short')}</p>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent className='min-w-[200px] space-y-1 p-2'>
                        {/* <p className='text-center underline mb-2'>{jotData.isPublic ? 'Public' : 'Private'} {type}</p> */}
                        <p><span className="font-bold">Category: </span> {jotData?.prompt?.category?.name ? jotData?.prompt?.category?.name : 'No Category'}</p>
                        <p><span className="font-bold">Submissions: </span>{jotData?.responses?.length} / {classSize}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <div className="text-xs absolute text-input right-3 bottom-3">
                {jotData.promptType === 'multi-question' ? (
                    <QuestionPopup promptQuestions={jotData as unknown as Prompt} />
                ) : (
                    jotData.isPublic && jotData.promptType === 'single-question' ? (
                        <p>Discussion: <span className={`font-bold pr-2 ${jotData.status === 'open' ? 'text-success' : 'text-destructive'}`}>{jotData.status}</span></p>
                    ) : (
                        <p>Private</p>
                    ))}
            </div>
        </div>
    )
}

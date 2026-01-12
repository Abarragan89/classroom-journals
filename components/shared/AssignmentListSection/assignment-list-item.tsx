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
    classSize,
}: {
    jotData: PromptSession,
    classId: string,
    teacherId?: string,
    classSize?: number,
}) {

    const totalSubmissions = jotData?.responses?.filter(response => response.completionStatus === 'COMPLETE' || response.completionStatus === 'RETURNED').length
    
    return (
        <div className='relative'>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link className='block relative' href={`/classroom/${classId}/${teacherId}/single-prompt-session/${jotData.id}`}>
                            {/* only show public or private if it is a blog, otherwise don't render */}
                            <article className='bg-card flex-start opacity-80 px-5 py-4 rounded-lg mb-4 border border-border hover:cursor-pointer hover:opacity-100'>
                                <p
                                    className='text-2xl font-bold bg-muted text-muted-foreground p-1 px-3 rounded-full mr-3'
                                >
                                    {jotData.promptType.charAt(0)}
                                </p>
                                <div className="flex flex-col relative">
                                    <p className='text-md font-bold line-clamp-1 text-foreground'>{jotData.title}</p>
                                    <div className="relative top-[11px] flex-between text-xs">
                                        <p>{formatDateLong(jotData.createdAt, 'short')}</p>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent className='min-w-[200px] space-y-1 p-2'>
                        <p><span className="font-bold">Category: </span> {jotData?.prompt?.category?.name ? jotData?.prompt?.category?.name : 'No Category'}</p>
                        <p><span className="font-bold">Submissions: </span>{totalSubmissions} / {classSize}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            {/* This needs to outside the Link so user can click on questionPopup without linking  */}
            <div className="text-xs text-muted-foreground absolute right-3 bottom-[6px]">
                {jotData.promptType === 'ASSESSMENT' ? (
                    <QuestionPopup promptQuestions={jotData as unknown as Prompt} />
                ) : (
                    jotData.isPublic && jotData.promptType === 'BLOG' ? (
                        <p>Discussion: <span className={`font-bold pr-2 ${jotData.status === 'OPEN' ? 'text-success' : 'text-destructive'}`}>{jotData.status}</span></p>
                    ) : (
                        <p>Private</p>
                    ))}
            </div>
        </div>
    )
}

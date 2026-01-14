import { Prompt, PromptSession } from '@/types'
import { formatDateLong } from '@/lib/utils'
import Link from 'next/link'
import QuestionPopup from '../prompt-card/question-popup'
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"

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
    const isAssessment = jotData.promptType === 'ASSESSMENT';

    return (
        <Link href={`/classroom/${classId}/${teacherId}/single-prompt-session/${jotData.id}`}>
            <Card className="w-full relative shadow-sm hover:shadow-md transition-shadow group mb-4 pt-3">
                <span className='absolute top-1.5 right-4 text-[.68rem] text-muted-foreground italic'>{formatDateLong(jotData.createdAt, 'short')}</span>

                <div className="p-4 pb-3 flex flex-col gap-4">
                    {/* Badge & Title Row */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Badge variant={isAssessment ? "default" : "secondary"} className="text-xl">
                                {isAssessment ? 'A' : 'B'}
                            </Badge>
                        </div>
                        <h3 className="font-semibold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                            {jotData.title}
                        </h3>
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap pt-3 border-t">
                        {jotData?.prompt?.category?.name && (
                            <>
                                <span className="text-xs text-muted-foreground">
                                    {jotData.prompt.category.name}
                                </span>
                                <Separator orientation="vertical" className="h-4" />
                            </>
                        )}

                        {isAssessment && (
                            <>
                                <QuestionPopup promptQuestions={jotData as unknown as Prompt} />
                            </>
                        )}

                        {!isAssessment && (
                            <>
                                {jotData.isPublic ? (
                                    <span>
                                        Discussion: <span className={`font-medium ${jotData.status === 'OPEN' ? 'text-success' : 'text-destructive'}`}>
                                            {jotData.status}
                                        </span>
                                    </span>
                                ) : (
                                    <span>Private</span>
                                )}
                            </>
                        )}

                        <Separator orientation="vertical" className="h-4" />

                        <span>
                            <span className="font-medium text-foreground">{totalSubmissions}</span> / {classSize} submitted
                        </span>
                    </div>
                </div>
            </Card>
        </Link>
    )
}

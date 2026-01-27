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
}: {
    jotData: PromptSession,
    classId: string,
    teacherId?: string,
}) {

    const totalSubmissions = jotData?.responses?.filter(response => response.completionStatus === 'COMPLETE').length
    const isAssessment = jotData.promptType === 'ASSESSMENT';

    return (
        <Link href={`/classroom/${classId}/${teacherId}/single-prompt-session/${jotData.id}`}>
            <Card className="w-full relative border shadow-md hover:border-primary hover:shadow-lg transition-shadow group mb-6 pt-3">
                <div className="flex-between text-[.68rem] px-4">
                    <Badge variant={isAssessment ? "default" : "secondary"} className="text-xs w-fit">
                        {isAssessment ? 'Assessment' : 'Blog'}
                    </Badge>
                    <span className='text-muted-foreground italic'>{formatDateLong(jotData.createdAt, 'short')}</span>
                </div>

                <div className="px-4 py-3 flex flex-col gap-4">
                    <h3 className="font-semibold text-base leading-tight line-clamp-1">
                        {jotData.title}
                    </h3>

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
                            <div
                                className="z-10"
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                }}
                            >
                                <QuestionPopup promptQuestions={jotData as unknown as Prompt} />
                            </div>
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
                                    <span>Private Blog</span>
                                )}
                            </>
                        )}
                        <Separator orientation="vertical" className="h-4" />

                        <span>
                            <span className="font-medium text-foreground">{totalSubmissions}</span> / {jotData?.responses?.length} submitted
                        </span>
                    </div>
                </div>
            </Card>
        </Link >
    )
}

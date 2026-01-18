import { Response, ResponseData } from '@/types'
import { formatDateLong } from '@/lib/utils'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function StudentAssignmentListItem({
    studentResponse,
}: {
    studentResponse: Response,
}) {

    const hrefLink = studentResponse?.completionStatus === 'COMPLETE' ?
        `response-review/${studentResponse?.id}` : studentResponse?.completionStatus === 'RETURNED' ?
            `response-review/${studentResponse?.id}` : `/jot-response/${studentResponse.id}?q=0`

    const isAssessment = studentResponse?.promptSession?.promptType === 'ASSESSMENT';

    function renderScore(): string {
        if (isAssessment) {
            const responseData = studentResponse?.response as unknown as ResponseData[];

            const gradedResponses = responseData?.filter(r => r.score !== undefined);

            if (!gradedResponses || gradedResponses.length === 0) return 'N/A';

            const totalQuestions = gradedResponses.length;
            const totalScore = gradedResponses.reduce((sum, r) => sum + (r.score || 0), 0);
            const percentage = (totalScore / totalQuestions) * 100;

            return `${percentage.toFixed(0)}%`;
        } else {
            const blogResponse = studentResponse?.response as unknown as ResponseData[];
            const score = blogResponse?.[0]?.score;
            return score !== undefined ? `${score}%` : 'N/A';
        }
    }

    const score = renderScore();
    const scoreValue = parseInt(score);
    const scoreColorClass = score === 'N/A' ? '' :
        scoreValue >= 80 ? 'text-success' :
            scoreValue >= 70 ? 'text-warning' :
                'text-destructive';


    return (
        // <div className='relative'>
        <Link className='block relative' href={hrefLink}>
            <Card className="w-full relative border shadow-md hover:border-primary hover:shadow-lg transition-shadow group mb-6 pt-3">
                <div className="flex-between text-[.68rem] px-4">
                    <Badge variant={studentResponse?.promptSession?.promptType === 'ASSESSMENT' ? "default" : "secondary"} className="text-xs w-fit">
                        {studentResponse?.promptSession?.promptType === 'ASSESSMENT' ? 'Assessment' : 'Blog'}
                    </Badge>
                    <span className='text-muted-foreground italic'>{formatDateLong(studentResponse?.createdAt, 'short')}</span>
                </div>
                <div className="px-4 py-3 flex flex-col gap-4">
                    <h3 className="font-semibold text-base leading-tight line-clamp-1">
                        {studentResponse?.promptSession?.title}
                    </h3>

                    {/* Metadata Footer */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap pt-3 border-t">

                        {/* Submission Status */}
                        {studentResponse.completionStatus === 'COMPLETE' && (
                            <span>Status: <span className={`font-bold pr-2 text-success`}>Completed</span></span>
                        )}
                        {studentResponse.completionStatus === 'INCOMPLETE' && (
                            <span>Status: <span className={`font-bold pr-2 text-destructive`}>Incomplete</span></span>
                        )}
                        {studentResponse.completionStatus === 'RETURNED' && (
                            <span>Status: <span className={`font-bold pr-2 text-warning`}>Returned</span></span>
                        )}

                        <Separator orientation="vertical" className="h-4" />

                        <span>
                            <p>Score: <span className={`font-bold ${scoreColorClass}`}>
                                {score}
                            </span></p>
                        </span>

                        <Separator orientation="vertical" className="h-4" />

                        {/* Show category on Assessment */}
                        {isAssessment && (
                            <>
                                <span className="text-xs text-muted-foreground">
                                    {studentResponse?.promptSession?.prompt?.category?.name}
                                </span>
                            </>
                        )}


                        {/* Show discussion status on Blog */}
                        {!isAssessment && (
                            <span>
                                Discussion: {studentResponse.promptSession?.status === 'OPEN' ? (
                                    <span className={`font-medium text-success`}>Open</span>
                                ) : (
                                    <span className={`font-medium text-destructive`}>Closed</span>
                                )}
                            </span>
                        )}
                    </div>

                </div>

            </Card>
        </Link>
    )
}
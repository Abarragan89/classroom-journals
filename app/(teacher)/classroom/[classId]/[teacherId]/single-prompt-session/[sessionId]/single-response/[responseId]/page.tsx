import BlogMetaDetails from '@/components/blog-meta-details';
import ScoreJournalForm from '@/components/forms/score-journal-form';
import CommentSection from '@/components/shared/comment-section';
import GradeResponseCard from '@/components/shared/grade-response-card';
import { Separator } from '@/components/ui/separator';
import { formatDateShort } from '@/lib/utils';
import Image from 'next/image';
import { Response, ResponseComment, ResponseData } from '@/types';
import { getSingleResponse } from '@/lib/actions/response.action';


export default async function SingleResponse({
    params
}: {
    params: Promise<{ responseId: string, teacherId: string, sessionId: string }>
}) {
    const { responseId, teacherId, sessionId } = await params;

    if (!responseId) {
        return <div>No response ID provided</div>;
    }

    const response = await getSingleResponse(responseId) as unknown as Response

    if (!response) {
        return <div>Response not found</div>;
    }

    const questionsAndAnswers = response.response as unknown as ResponseData[]
    const isMultiQuestion = response?.promptSession?.promptType === 'multi-question';

    return (
        <div className='mb-10'>
            <div className="mb-10 space-y-1">
                <h2 className="text-2xl lg:text-3xl mt-2">Response By: {response?.student?.name}</h2>
                <p>Submitted: {formatDateShort(response.submittedAt)}</p>
            </div>
            <div className="flex flex-wrap justify-start gap-10 max-w-[1200px] mx-auto">
                {isMultiQuestion ? (
                    <GradeResponseCard
                        questionsAndAnswers={questionsAndAnswers}
                        responseId={responseId}
                    />
                ) : (
                    <div className='relative w-full'>
                        <ScoreJournalForm
                            responseId={response.id}
                            currentScore={(response?.response as { score?: number }[] | undefined)?.[0]?.score ?? 0}
                        />
                        <p className='text-md font-bold'>{response.promptSession?.title}</p>
                        {/* <p className='mt-10 bg-card p-5 rounded-md'>
                            {(response?.response as { answer?: string }[] | undefined)?.[0]?.answer ?? ''}
                        </p> */}
                        {/* Student Blog */}

                        <div className="max-w-[700px] px-3 mx-auto">
                            <BlogMetaDetails
                                responseData={response}
                                studentId={response?.student?.id as string}
                            />

                            <Image
                                src={(response?.response as { answer: string }[])?.[2]?.answer}
                                width={700}
                                height={394}
                                alt={'blog cover photo'}
                                className="block mx-auto mb-5"
                                priority
                            />
                            <p className="leading-[2rem] text-foreground text-[16px] sm:text-[19px]">{(response.response as unknown as ResponseData[])?.[0].answer}</p>
                            <Separator className="my-5" />
                            <CommentSection
                                comments={response.comments as unknown as ResponseComment[]}
                                responseId={responseId}
                                studentId={teacherId}
                                sessionId={sessionId}
                                discussionStatus={'open'}
                            />
                        </div>


                    </div>
                )}
            </div>
        </div >
    );
}

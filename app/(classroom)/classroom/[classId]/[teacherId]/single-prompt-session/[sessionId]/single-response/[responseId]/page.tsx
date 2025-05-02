import BlogMetaDetails from '@/components/blog-meta-details';
import ScoreJournalForm from '@/components/forms/score-journal-form';
import CommentSection from '@/components/shared/comment-section';
import GradeResponseCard from '@/components/shared/grade-response-card';
import { Separator } from '@/components/ui/separator';
import { formatDateShort } from '@/lib/utils';
import Image from 'next/image';
import { Response, ResponseComment, ResponseData } from '@/types';
import { getAllResponsesFromPompt, getSingleResponse } from '@/lib/actions/response.action';
import { StudentComboBox } from './student-combobox';
import HandleToggleReturnStateBtn from '@/components/buttons/handle-toggle-return-state-btn';
import DeleteResponseBtn from './delete-response-btn';
import PrintViewBlog from './print-view';


export default async function SingleResponse({
    params
}: {
    params: Promise<{ responseId: string, teacherId: string, sessionId: string, classId: string }>
}) {
    const { responseId, teacherId, sessionId, classId } = await params;

    if (!responseId) {
        return <div>No response ID provided</div>;
    }

    const response = await getSingleResponse(responseId) as unknown as Response;
    const classRosterAndScores = await getAllResponsesFromPompt(sessionId) as unknown as Response[]

    const rosterAlphabetized = classRosterAndScores.sort((a, b) => {
        const lastNameA = a?.student?.name?.split(" ")[1] as string; // Get second word (last name)
        const lastNameB = b?.student?.name?.split(" ")[1] as string;
        return lastNameA.localeCompare(lastNameB); // Sort alphabetically
    });

    if (!response) {
        return <div>Response not found</div>;
    }

    const questionsAndAnswers = response?.response as unknown as ResponseData[]
    const isMultiQuestion = response?.promptSession?.promptType === 'multi-question';

    return (
        <>
            <div className='mb-10 print:hidden'>
                <div className="mb-5 space-y-3">
                    <StudentComboBox
                        responses={rosterAlphabetized}
                    />
                    <p className='text-input'>Submitted: {formatDateShort(response?.submittedAt)}</p>
                    <div className="flex-between">
                        <HandleToggleReturnStateBtn
                            responseId={responseId}
                            initialSubmitStatus={response?.isSubmittable}
                        />
                        <DeleteResponseBtn
                            responseId={responseId}
                            sessionId={sessionId}
                            teacherId={teacherId}
                            classId={classId}
                        />
                    </div>
                </div>
                <div className="max-w-[1200px] mx-auto relative">
                    {isMultiQuestion ? (
                        <GradeResponseCard
                            questionsAndAnswers={questionsAndAnswers}
                            responseId={responseId}
                        />
                    ) : (
                        <div className='relative w-full'>
                            <ScoreJournalForm
                                responseId={response?.id}
                                currentScore={(response?.response as { score?: number }[] | undefined)?.[0]?.score ?? ''}
                            />
                            <p className='text-md font-bold'>{response.promptSession?.title}</p>

                            <div className="max-w-[700px] px-3 mx-auto mt-10">
                                <BlogMetaDetails
                                    responseData={response}
                                    studentId={teacherId}
                                />

                                <Image
                                    src={(response?.response as { answer: string }[])?.[2]?.answer || 'https://unfinished-pages.s3.us-east-2.amazonaws.com/fillerImg.png'}
                                    width={700}
                                    height={394}
                                    alt={'blog cover photo'}
                                    className="block mx-auto mb-5"
                                    priority
                                />
                                <p className="leading-[2rem] text-foreground text-[16px] sm:text-[19px] whitespace-pre-line">{(response.response as unknown as ResponseData[])?.[0].answer}</p>
                                <Separator className="my-5" />
                                <CommentSection
                                    comments={response.comments as unknown as ResponseComment[]}
                                    responseId={responseId}
                                    studentId={teacherId}
                                    sessionId={sessionId}
                                    discussionStatus={'open'}
                                    isTeacherView={true}
                                    classroomId={classId}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div >
            <PrintViewBlog
                response={response}
            />
        </>
    );
}

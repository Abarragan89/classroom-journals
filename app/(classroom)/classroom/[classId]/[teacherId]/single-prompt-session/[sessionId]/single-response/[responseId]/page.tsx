import BlogMetaDetails from '@/components/blog-meta-details';
import ScoreJournalForm from '@/components/forms/score-journal-form';
import CommentSection from '@/components/shared/comment-section';
import GradeResponseCard from '@/components/shared/grade-response-card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Response, ResponseComment, ResponseData } from '@/types';
import { getAllResponsesFromPompt, getSingleResponse } from '@/lib/actions/response.action';
import { StudentComboBox } from './student-combobox';
import HandleToggleReturnStateBtn from '@/components/buttons/handle-toggle-return-state-btn';
import DeleteResponseBtn from './delete-response-btn';
import PrintViewBlog from './print-view';
import ToggleSpellCheck from './toggle-spell-check';


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
    const isMultiQuestion = response?.promptSession?.promptType === 'ASSESSMENT';

    return (
        <>
            <div className='mb-10 print:hidden'>
                <div className="mb-5">
                    <StudentComboBox
                        responses={rosterAlphabetized}
                    />
                    <div className="flex-between items-end mt-8">
                        <ToggleSpellCheck
                            responseId={responseId}
                            spellCheckEnabled={response?.spellCheckEnabled}
                        />
                        {response?.submittedAt && (
                            <div className='flex-end gap-x-5'>
                                <HandleToggleReturnStateBtn
                                    responseId={responseId}
                                    isCompleted={response?.completionStatus === 'COMPLETE'}
                                />

                                <DeleteResponseBtn
                                    responseId={responseId}
                                    sessionId={sessionId}
                                    teacherId={teacherId}
                                    classId={classId}
                                />
                            </div>
                        )}
                    </div>
                    {!isMultiQuestion && (
                        <div className='flex-end mt-5'>
                            <ScoreJournalForm
                                responseId={response?.id}
                                currentScore={(response?.response as { score?: number }[] | undefined)?.[0]?.score ?? ''}
                            />
                        </div>
                    )}
                </div>
                <div className="max-w-[1200px] mx-auto relative">
                    {isMultiQuestion ? (
                        <GradeResponseCard
                            questionsAndAnswers={questionsAndAnswers}
                            responseId={responseId}
                        />
                    ) : (
                        <div className='w-full'>
                            <p className='text-md font-bold'>{response.promptSession?.title}</p>

                            <div className="max-w-[700px] px-3 mx-auto mt-5">
                                <BlogMetaDetails
                                    responseData={response}
                                    studentId={teacherId}
                                    teacherView={true}
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
                                    discussionStatus={'OPEN'}
                                    isTeacherView={true}
                                    classroomId={classId}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <PrintViewBlog
                response={response}
            />
        </>
    );
}

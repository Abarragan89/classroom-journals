import BlogMetaDetails from '@/components/blog-meta-details';
import ScoreJournalForm from '@/components/forms/score-journal-form';
import CommentSection from '@/components/shared/comment-section';
import GradeResponseCard from '@/components/shared/grade-response-card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Response, ResponseComment, ResponseData } from '@/types';
import { getSingleResponse, getAllResponsesFromPrompt } from '@/lib/server/responses';
import { StudentComboBox } from './student-combobox';
import PrintViewBlog from './print-view';
import ToggleSpellCheckAndVoiceToText from './toggle-spell-check';
import ResponseActions from './response-actions';


export default async function SingleResponse({
    params
}: {
    params: Promise<{ responseId: string, teacherId: string, sessionId: string, classId: string }>
}) {
    const { responseId, teacherId, sessionId, classId } = await params;

    if (!responseId) {
        return <div>No response ID provided</div>;
    }

    const response = await getSingleResponse(responseId, teacherId) as unknown as Response;
    const classRosterAndScores = await getAllResponsesFromPrompt(sessionId, teacherId) as unknown as Response[]

    const rosterAlphabetized = classRosterAndScores.sort((a, b) => {
        const lastNameA = a?.student?.name?.split(" ")[1] as string; // Get second word (last name)
        const lastNameB = b?.student?.name?.split(" ")[1] as string;
        return lastNameA?.localeCompare(lastNameB); // Sort alphabetically
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
                    <div className="flex justify-between items-baseline mt-5 relative">
                        <ToggleSpellCheckAndVoiceToText
                            responseId={responseId}
                            voiceToTextEnabled={response?.isVoiceToTextEnabled as boolean}
                            spellCheckEnabled={response?.spellCheckEnabled}
                            teacherId={teacherId}
                        />

                    </div>
                    <div className="flex-end mb-8 relative">
                        <ResponseActions
                            initialResponse={response}
                            responseId={responseId}
                            sessionId={sessionId}
                            teacherId={teacherId}
                            classId={classId}
                        />
                        {!isMultiQuestion && (
                            <ScoreJournalForm
                                teacherId={teacherId}
                                responseId={response?.id}
                                currentScore={(response?.response as { score?: number }[] | undefined)?.[0]?.score ?? ''}
                                studentWriting={(response.response as unknown as ResponseData[])?.[0]?.answer || ''}
                            />
                        )}
                    </div>
                </div>
                <div className={`max-w-[1200px] mx-auto relative ${isMultiQuestion ? 'mt-[110px]' : ''}`}>
                    {isMultiQuestion ? (
                        <GradeResponseCard
                            questionsAndAnswers={questionsAndAnswers}
                            responseId={responseId}
                            teacherId={teacherId}
                            sessionId={sessionId}
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
                                <p className="leading-[2rem] text-foreground text-[16px] sm:text-[19px] whitespace-pre-line break-words">{(response.response as unknown as ResponseData[])?.[0].answer}</p>
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
            {!isMultiQuestion && (
                <PrintViewBlog
                    response={response}
                    teacherId={teacherId}
                />
            )}
        </>
    );
}

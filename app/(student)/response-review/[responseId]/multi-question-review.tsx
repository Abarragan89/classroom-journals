'use client'
import { Button } from '@/components/ui/button'
import { ResponseData } from '@/types'
import Editor from '@/components/shared/prompt-response-editor/editor'
import { useState } from 'react'
import { updateASingleResponse } from '@/lib/actions/response.action';
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { responsePercentage } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export default function MultiQuestionReview({
    allQuestions,
    isSubmittable,
    setAllQuestions,
    responseId,
    showGrades,
    isTeacherPremium,
    gradeLevel,
    spellCheckEnabled,
    studentId,
    isQuestionReview = false
}: {
    allQuestions: ResponseData[],
    setAllQuestions: React.Dispatch<React.SetStateAction<ResponseData[]>>
    isSubmittable: boolean,
    // if there is a responseId, then it's been given back to student
    // and needs the submit button here to update
    responseId?: string,
    showGrades: boolean,
    isTeacherPremium: boolean,
    gradeLevel: string,
    spellCheckEnabled: boolean,
    studentId: string,
    // If this is viewed as a question review (before submission)
    isQuestionReview?: boolean
}) {

    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isAssignmentCollected, setIsAssignmentCollected] = useState<boolean>(false);

    async function updateResponsesHandler(responseData: ResponseData[]) {
        if (isLoading || !responseId) return
        try {
            setIsLoading(true)
            const submittedAt = new Date()
            const updatedResponse = await updateASingleResponse(
                studentId,
                responseId,
                responseData,
                submittedAt,
                'ASSESSMENT',
                isTeacherPremium,
                gradeLevel,
            )

            // Handle collected assignment
            if (updatedResponse?.isCollected) {
                // Show modal and redirect
                setIsAssignmentCollected(true);
                return;
            }

            if (updatedResponse?.success) {
                router.push('/student-dashboard')
                toast('Assignment Submitted!')
            }
        } catch (error) {
            console.log('error updating responses', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Handle text change for a specific question
    const handleTextChange = (index: number, newAnswer: string) => {
        setAllQuestions(prevQuestions =>
            prevQuestions.map((q, i) =>
                i === index ? { ...q, answer: newAnswer } : q
            )
        );
    };

    const gradePercentage = responsePercentage(allQuestions)

    return (
        <>
            <Dialog open={isAssignmentCollected}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assignment Collected</DialogTitle>
                    </DialogHeader>
                    <p className="my-3">Your teacher has collected this assignment. You can no longer edit your answers.</p>
                    <Button onClick={() => router.push("/student-dashboard")}>
                        Go to Dashboard
                    </Button>
                </DialogContent>
            </Dialog>


            <div className="mx-auto w-full relative max-w-[1000px] mt-5">
                {isQuestionReview && (
                    <h2 className="h2-bold mb-10 text-center">Question Review</h2>
                )}
                {showGrades && (
                    <div className="flex-between mb-5">
                        <Badge className='text-md'>Grade: {gradePercentage}</Badge>
                    </div>
                )}

                <div className="space-y-10">
                    {allQuestions?.map((responseData, index) => (
                        <Editor
                            key={index}
                            jotType='ASSESSMENT'
                            // Only show score when they are open
                            score={showGrades ? responseData?.score : undefined}
                            questionText={responseData.question}
                            questionNumber={index + 1}
                            isPreGraded={isQuestionReview}
                            totalQuestions={allQuestions.length}
                            setJournalText={(newText) => handleTextChange(index, newText as string)}
                            journalText={responseData.answer}
                            spellCheckEnabled={spellCheckEnabled}
                            isDisabled={!isSubmittable}
                        />
                    ))}
                </div>


                {isSubmittable && responseId &&
                    <div className="flex-center">
                        <Button
                            disabled={isLoading}
                            onClick={() => updateResponsesHandler(allQuestions)}
                            className="mr-0 block"
                        >Submit</Button>
                    </div>
                }
            </div>
        </>
    );
}



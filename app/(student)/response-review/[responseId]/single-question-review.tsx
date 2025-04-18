'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { ResponseData } from '@/types'
import Editor from '@/components/shared/prompt-response-editor/editor'
import { useRef, useState } from 'react'
import { updateASingleResponse } from '@/lib/actions/response.action';
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

export default function SingleQuestionReview({
    questions,
    isSubmittable,
    responseId,
    showGrades,
    isPublic,
    promptSessionId
}: {
    questions: ResponseData[],
    isSubmittable: boolean,
    responseId: string,
    showGrades: boolean,
    isPublic: boolean,
    promptSessionId: string
}) {

    const router = useRouter();
    const inputRef = useRef<HTMLDivElement>(null);
    // Store full question objects, modifying only answers
    const [allQuestions, setAllQuestions] = useState<ResponseData[]>(questions);
    const [isLoading, setIsLoading] = useState<boolean>(false)

    async function updateResponsesHandler(responseData: ResponseData[]) {
        if (isLoading) return
        try {
            setIsLoading(true)
            const submittedAt = new Date()
            const updatedResponse = await updateASingleResponse(responseId, responseData, submittedAt)
            if (updatedResponse.success) {
                router.push('/my-work')
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

    const gradePercentage = `${questions?.[0]?.score}%`

    return (
        <div className="w-full relative">
            <div className="flex-between mt-10">
                {showGrades && (
                    <p className='font-bold text-lg text-input ml-0 text-right mb-10'>Grade: <span
                        className={`
                        ${parseInt(gradePercentage) >= 90 ? 'text-success' : parseInt(gradePercentage) >= 70 ? 'text-warning' : 'text-destructive'}
                        `}
                    >{gradePercentage}</span></p>
                )}
                {isSubmittable &&
                    <Button
                        onClick={() => updateResponsesHandler(allQuestions)}
                        className="mr-0 block mt-5 mb-10"
                    >Submit</Button>
                }
                {isPublic && (
                    <div className="flex-end w-full">
                        <Button asChild
                            className='mb-10'
                        >
                            <Link
                                href={`/discussion-board/${promptSessionId}/response/${responseId}`}
                            >
                                View Discussion
                            </Link>
                        </Button>
                    </div>
                )
                }
            </div>
            {allQuestions.slice(0, 2).map((responseData, index) => (
                <Card className="w-full p-4 space-y-2 max-w-[700px] mx-auto mb-10" key={index}>
                    <CardTitle className="p-2 leading-snug text-center">
                        {responseData.question}
                    </CardTitle>
                    <CardContent className="p-3 pt-0">
                        <p className="ml-1 mb-1 text-sm font-bold">Response:</p>
                        {isSubmittable ? (
                            <>
                                <Editor
                                    setJournalText={(newText) => handleTextChange(index, newText as string)}
                                    journalText={responseData.answer}
                                    inputRef={inputRef}
                                    isInReview={true}
                                    characterLimit={index === 1 ? 70 : undefined}
                                />
                            </>
                        ) : (
                            <div className='bg-background px-4  py-3 m-0 rounded-md'>
                                <p>{responseData.answer}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}



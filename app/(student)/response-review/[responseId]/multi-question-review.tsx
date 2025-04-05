'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { ResponseData } from '@/types'
import Editor from '@/components/shared/prompt-response-editor/editor'
import { useEffect, useRef, useState } from 'react'
import { updateASingleResponse } from '@/lib/actions/response.action';
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { responsePercentage } from '@/lib/utils'

export default function MultiQuestionReview({
    allQuestions,
    isSubmittable,
    setAllQuestions,
    responseId,
    showGrades,
    promptTitle,
}: {
    allQuestions: ResponseData[],
    setAllQuestions: React.Dispatch<React.SetStateAction<ResponseData[]>>
    isSubmittable: boolean,
    // if there is a responseId, then it's been given back to student
    // and needs the submit button here to update
    responseId?: string,
    showGrades: boolean
    promptTitle: string
}) {

    const router = useRouter();
    const inputRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [cursorIndexes, setCursorIndexes] = useState<Record<number, number> | undefined>(undefined);

    useEffect(() => {
        if (allQuestions?.length > 0) {
            setCursorIndexes(Object.fromEntries(allQuestions?.map((q: ResponseData, i: number) => [i, (q.answer || "").length])))
        }
    }, [allQuestions])

    async function updateResponsesHandler(responseData: ResponseData[]) {
        if (isLoading || !responseId) return
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
        setCursorIndexes(prev => ({ ...prev, [index]: newAnswer.length })); // Keep cursor at the end
    };

    return (
        <div className="w-full max-w-[900px] mx-auto relative px-5">
            <div className="flex-between mt-5">
                {showGrades && (
                    <p className='font-bold text-right'>Grade: <span className="text-success">{responsePercentage(allQuestions)}</span></p>
                )}
                {isSubmittable && responseId &&
                    <Button
                        onClick={() => updateResponsesHandler(allQuestions)}
                        className="mr-0 block"
                    >Submit</Button>
                }
            </div>
            <p className="h2-bold text-center mb-5">{promptTitle}</p>
            {allQuestions?.map((responseData, index) => (
                <Card className="w-full p-4 space-y-2 max-w-[700px] mx-auto mb-10 relative" key={index}>
                    {showGrades && (
                        <p className='absolute right-5 top-3 text-sm'>Score: {responseData.score}</p>
                    )}
                    <CardTitle className="p-2 leading-snug text-center">
                        {responseData.question}
                    </CardTitle>
                    <CardContent className="p-3 pt-0">
                        <p className="ml-1 mb-1 text-sm font-bold">Answer:</p>
                        {isSubmittable ? (
                            <>
                                <div className='bg-background px-4  py-3 m-0 rounded-md'>
                                    <Editor
                                        setJournalText={(newText) => handleTextChange(index, newText as string)}
                                        journalText={responseData.answer}
                                        // setIsTyping={setIsTyping}
                                        cursorIndex={cursorIndexes?.[index] ?? 0}
                                        setCursorIndex={(newCursor) =>
                                            setCursorIndexes(prev => ({ ...prev, [index]: newCursor as number }))
                                        }
                                        inputRef={inputRef}
                                        isInReview={true}
                                    />
                                </div>
                                <p className="text-sm text-center mt-2 italic">click in the box to start typing</p>
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



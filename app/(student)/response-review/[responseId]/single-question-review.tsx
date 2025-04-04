'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { ResponseData } from '@/types'
import Editor from '@/components/shared/prompt-response-editor/editor'
import { useRef, useState } from 'react'
import { updateASingleResponse } from '@/lib/actions/response.action';
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function SingleQuestionReview({
    questions,
    isSubmittable,
    responseId
}: {
    questions: ResponseData[],
    isSubmittable: boolean,
    responseId: string
}) {

    const router = useRouter();
    const inputRef = useRef<HTMLDivElement>(null);
    // Store full question objects, modifying only answers
    const [allQuestions, setAllQuestions] = useState<ResponseData[]>(questions);
    const [cursorIndexes, setCursorIndexes] = useState<Record<number, number>>(() =>
        Object.fromEntries(questions?.map((q, i) => [i, (q.answer || "").length]))
    );

    async function updateResponsesHandler(responseData: ResponseData[]) {
        try {
            const submittedAt = new Date()
            const updatedResponse = await updateASingleResponse(responseId, responseData, submittedAt)
            if (updatedResponse.success) {
                router.push('/my-work')
                toast('Assignment Submitted!')
            }
        } catch (error) {
            console.log('error updating responses', error)
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

    console.log("allquesitons", allQuestions)

    return (
        <div className="w-full max-w-[900px] mx-auto relative px-5 mt-10">
            {isSubmittable &&
                <Button
                    onClick={() => updateResponsesHandler(allQuestions)}
                    className="mr-0 block mt-5 mb-10"
                >Submit</Button>
            }
            {allQuestions.slice(0, 2).map((responseData, index) => (
                <Card className="w-full p-4 space-y-2 max-w-[700px] mx-auto mb-10" key={index}>
                    <CardTitle className="p-2 leading-snug text-center">
                        {responseData.question}
                    </CardTitle>
                    <CardContent className="p-3 pt-0">
                        <p className="ml-1 mb-1 text-sm font-bold">Response:</p>
                        {isSubmittable ? (
                            <>
                                <div className='bg-background px-4  py-3 m-0 rounded-md'>
                                    <Editor
                                        setJournalText={(newText) => handleTextChange(index, newText as string)}
                                        journalText={responseData.answer}
                                        // setIsTyping={setIsTyping}
                                        cursorIndex={cursorIndexes[index] ?? 0}
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



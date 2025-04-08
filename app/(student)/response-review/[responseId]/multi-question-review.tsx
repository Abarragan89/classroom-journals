'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { ResponseData } from '@/types'
import Editor from '@/components/shared/prompt-response-editor/editor'
import { useRef, useState } from 'react'
import { updateASingleResponse } from '@/lib/actions/response.action';
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { responsePercentage } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

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
    };

    function displayGradeUI(score: number) {
        switch (score) {
            case 0:
                return 'Wrong';
                break;
            case 0.5:
                return 'Half Credit';
                break;
            case 1:
                return 'Correct';
                break

        }
    }

    const gradePercentage = responsePercentage(allQuestions)
    return (
        <div className="w-full relative">
            <p className="h2-bold">{promptTitle}</p>
            <div className="flex-between">
                {showGrades && (
                    <p className='font-bold text-lg text-input ml-0 text-right mb-10'>Grade: <span
                        className={`
                        ${parseInt(gradePercentage) >= 90 ? 'text-success' : parseInt(gradePercentage) >= 70 ? 'text-warning' : 'text-destructive'}
                        `}
                    >{gradePercentage}</span></p>
                )}
                {isSubmittable && responseId &&
                    <Button
                        onClick={() => updateResponsesHandler(allQuestions)}
                        className="mr-0 block"
                    >Submit</Button>
                }
            </div>
            {allQuestions?.map((responseData, index) => (
                <Card className="w-full max-w-[500px] p-4 space-y-2  mx-auto mb-10 relative" key={index}>
                    <div className="flex-between left-5 right-5 absolute top-2 text-sm">
                        <p className='text-accent font-bold'>Question {index + 1}</p>
                        {showGrades && (
                            <p className={`
                                font-bold
                                ${responseData.score === 1 ? 'text-success' : responseData.score === 0 ? 'text-destructive' : 'text-warning'}
                                `}
                            >{displayGradeUI(responseData?.score)}</p>
                        )}
                    </div>
                    <CardTitle className="p-2 leading-snug text-center font-normal italic">
                    <Separator className='mb-5 mt-2'/>
                        {responseData.question}
                    </CardTitle>
                    <CardContent className="p-3 pt-0">
                        <p className="ml-1 mb-1 text-sm font-bold">Answer:</p>
                        {isSubmittable ? (
                            <>
                                <Editor
                                    setJournalText={(newText) => handleTextChange(index, newText as string)}
                                    journalText={responseData.answer}
                                    inputRef={inputRef}
                                    isInReview={true}
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



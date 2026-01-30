'use client'
import GradingPanel from "@/components/grading-panel"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponseData } from "@/types"
import { useState } from "react"

export default function GradeResponseCard({
    questionsAndAnswers,
    responseId,
    teacherId,
    sessionId
}: {
    questionsAndAnswers: ResponseData[],
    responseId: string,
    teacherId: string,
    sessionId: string
}) {

    const [responseArr, setResponseArr] = useState<ResponseData[]>(questionsAndAnswers)

    function updateScoreUIHandler(questionNumber: number, score: number) {
        
        setResponseArr(prev => {
            const updatedArr = [...prev]
            updatedArr[questionNumber] = {
                ...updatedArr[questionNumber],
                score
            }
            return updatedArr
        })
    }

    function renderScoreUIText(score: number) {
        switch (score) {
            case 0:
                return (
                    <span className="text-destructive font-bold ml-1">Incorrect</span>
                );
            case 0.5:
                return (
                    <span className="text-warning font-bold ml-1">Half Credit</span>
                );
            case 1:
                return (
                    <span className="text-success font-bold ml-1">Correct</span>
                );
            default:
                return (
                    <span className="font-bold ml-1">Not Graded</span>
                );
        }
    }

    return (
        <>
            <div className="mb-8 grid-cols-1 xl:grid-cols-2 grid gap-7 items-start">
                {responseArr?.length > 0 && responseArr.map((responseData: ResponseData, index: number) => (
                    <Card className='w-full mx-auto border' key={index}>
                        <CardHeader>
                            <CardTitle className='text-sm font-bold flex-between border-b'>
                                <p>Question {index + 1}</p>
                                <p className='font-bold'> Marked as:
                                    {renderScoreUIText(responseData.score)}
                                </p>
                            </CardTitle>
                        </CardHeader>
                        <div className="flex-between text-sm relative">
                        </div>
                        <CardContent className='px-5 pb-0  pt-0'>
                            <p className='mb-6 mt-3 leading-snug text-center font-medium italic'>{responseData.question}</p>
                            <div className={`
                            p-3 m-0 rounded-md bg-background border-4      
                             ${responseData.score === 1
                                    ? 'border-success'
                                    : responseData.score === 0.5
                                        ? 'border-warning'
                                        : responseData.score === 0
                                            ? 'border-destructive'
                                            : 'border-muted'
                                }
                            `}>
                                {responseData?.answer || <span className="italic">No answer provided.</span>}
                            </div>
                        </CardContent>
                        <CardFooter className="block p-5">
                            <GradingPanel
                                currentScore={responseData.score}
                                responseId={responseId}
                                questionNumber={index}
                                updateScoreUIHandler={updateScoreUIHandler}
                                teacherId={teacherId}
                                sessionId={sessionId}
                            />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </>
    )
}

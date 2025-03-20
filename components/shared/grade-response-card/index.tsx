"use client";
import { useState } from "react";
import GradingPanel from "@/components/grading-panel"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ResponseData } from "@/types"

export default function GradeResponseCard({
    questionsAndAnswers,
    responseId
}: {
    questionsAndAnswers: ResponseData[],
    responseId: string
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
                    <span className="text-yellow-500 font-bold ml-1">Half Credit</span>
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
            {responseArr?.length > 0 && responseArr.map((responseData: ResponseData, index: number) => (
                <Card className='w-full p-4 space-y-2 max-w-[700px] mx-auto' key={index}>
                    <div className="flex-between text-sm">
                        <p className='ml-2'> Marked As:
                            {renderScoreUIText(responseData.score)}
                        </p>
                        <GradingPanel
                            currentScore={responseData.score}
                            responseId={responseId}
                            questionNumber={index}
                            updateScoreUIHandler={updateScoreUIHandler}
                        />
                    </div>
                    <Separator />
                    <CardTitle className='p-2 leading-snug text-center'>{responseData.question}</CardTitle>
                    <CardContent className='p-3 pt-0'>
                        <p className='ml-1 text-sm'>Answer:</p>
                        <div className='bg-background p-2 m-0 rounded-md'>
                            {responseData.answer}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </>
    )
}

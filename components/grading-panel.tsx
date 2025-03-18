"use client"
import { Check, X } from "lucide-react"
import { gradeStudentResponse } from "@/lib/actions/response.action";
import { useState } from "react";
import { BarLoader } from "react-spinners"

export default function GradingPanel({
    responseId,
    questionNumber,
    updateScoreUIHandler
}: {
    responseId: string,
    questionNumber: number,
    updateScoreUIHandler: (questionNumber: number, score: number) => void;
}) {

    const [isGrading, setIsGrading] = useState<boolean>(false)

    async function updateResponseScore(score: number) {
        try {
            setIsGrading(true)
            await gradeStudentResponse(responseId, questionNumber, score)
            updateScoreUIHandler(questionNumber, score)
        } catch (error) {
            console.log('error updating score ', error)
        } finally {
            setIsGrading(false)
        }
    }

    const iconStyles = 'text-slate-950 border border-border opacity-85 hover:cursor-pointer hover:opacity-100 p-1 rounded-full'

    return (
        <div className="flex gap-x-8 mx-auto">
            {isGrading ? (
                <BarLoader
                    color={'white'}
                    width={30}
                    height={2}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                    className="mb-1"
                />
            ) : (
                <>
                    <X
                        onClick={() => updateResponseScore(0)}
                        size={28}
                        className={`bg-destructive ${iconStyles}`} />
                    <p
                        onClick={() => updateResponseScore(0.5)}
                        className={`bg-yellow-500 text-sm ${iconStyles}`}
                    >0.5
                    </p>
                    <Check
                        onClick={() => updateResponseScore(1)}
                        size={28}
                        className={`bg-green-600 ${iconStyles}`}
                    />
                </>
            )}
        </div>
    )
}

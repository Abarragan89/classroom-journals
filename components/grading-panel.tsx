"use client"
import { Check, X } from "lucide-react"
import { gradeStudentResponse } from "@/lib/actions/response.action"

export default function GradingPanel({
    responseId,
    questionNumber,
    updateScoreUIHandler
}: {
    responseId: string,
    questionNumber: number,
    updateScoreUIHandler: (questionNumber: number, score: number) => void;
}) {

    async function updateResponseScore(score: number) {
        try {
            await gradeStudentResponse(responseId, questionNumber, score)
            updateScoreUIHandler(questionNumber, score)
        } catch (error) {
            console.log('error updating score ', error)
        }
    }

    const iconStyles = 'text-slate-950 border border-border opacity-85 hover:cursor-pointer hover:opacity-100 p-2 rounded-full'

    return (
        <div className="flex gap-x-8 mx-auto">
            <X
                onClick={() => updateResponseScore(0)}
                size={35}
                className={`bg-destructive ${iconStyles}`} />

            <p
                onClick={() => updateResponseScore(0.5)}
                className={`bg-yellow-500 text-sm ${iconStyles}`}
            >0.5
            </p>
            <Check
                onClick={() => updateResponseScore(1)}
                size={35}
                className={`bg-green-600 ${iconStyles}`}
            />
        </div>
    )
}

"use client"
import { Check, X } from "lucide-react"
import { gradeStudentResponse } from "@/lib/actions/response.action";
import { useState } from "react";
import { BarLoader } from "react-spinners"
import { useQueryClient } from "@tanstack/react-query";
import { PromptSession, Response, ResponseData } from "@/types";
import { JsonValue } from "@prisma/client/runtime/library";

export default function GradingPanel({
    responseId,
    questionNumber,
    updateScoreUIHandler,
    currentScore,
    updateUIQuestionAccordion,
    teacherId,
    sessionId
}: {
    responseId: string;
    questionNumber: number;
    updateScoreUIHandler?: (questionNumber: number, score: number) => void;
    updateUIQuestionAccordion?: (newScore: number) => void;
    currentScore: number;
    teacherId: string;
    sessionId: string;
}) {

    console.log('session id ', sessionId)

    const [isGrading, setIsGrading] = useState<boolean>(false)
    const [currentScoreState, setCurrentScoreState] = useState<number>(currentScore)
    const queryClient = useQueryClient();

    async function updateResponseScore(score: number) {
        try {
            setIsGrading(true)
            await gradeStudentResponse(responseId, questionNumber, score, teacherId)
            
            // Always update the cache if sessionId is provided
            if (sessionId) {
                queryClient.setQueryData<PromptSession>(['getSingleSessionData', sessionId], (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        responses: old.responses?.map((r: Response) =>
                            r.id === responseId
                                ? {
                                    ...r, 
                                    response: (r.response as unknown as ResponseData[]).map((q: ResponseData, idx: number) =>
                                        idx === questionNumber ? { ...q, score } : q
                                    ) as unknown as JsonValue
                                }
                                : r
                        )
                    };
                });
            }

            // Update local UI state
            if (updateScoreUIHandler) {
                updateScoreUIHandler(questionNumber, score)
            } else if (updateUIQuestionAccordion) {
                updateUIQuestionAccordion(score)
            }
            
            setCurrentScoreState(score)
        } catch (error) {
            console.log('error updating score ', error)
        } finally {
            setIsGrading(false)
        }
    }

    const iconStyles = 'text-slate-950 p-1 rounded-full'

    return (
        <div className="flex gap-x-8">
            {isGrading ? (
                <BarLoader
                    color={'white'}
                    width={70}
                    height={5}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                    className="my-3 mx-auto"
                />
            ) : (
                <>
                    <X
                        onClick={() => { if (currentScore !== 0) updateResponseScore(0) }}
                        size={25}
                        className={`bg-destructive ${iconStyles} ${currentScoreState === 0 ? 'opacity-100' : 'opacity-40 hover:cursor-pointer hover:opacity-100'}`} />
                    <p
                        onClick={() => { if (currentScore !== 0.5) updateResponseScore(0.5) }}
                        className={`bg-warning text-[.93rem] ${iconStyles} ${currentScoreState === 0.5 ? 'opacity-100' : 'opacity-40 hover:cursor-pointer hover:opacity-100'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 50 50">
                            <text x="37%" y="30%" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="26" fontWeight={600} fill="black">1</text>
                            <line x1="12" y1="40" x2="40" y2="9" stroke="black" strokeWidth="3" />
                            <text x="66%" y="80%" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="26" fontWeight={600} fill="black">2</text>
                        </svg>
                    </p>
                    <Check
                        onClick={() => { if (currentScoreState !== 1) updateResponseScore(1) }}
                        size={25}
                        className={`bg-success ${iconStyles} ${currentScoreState === 1 ? 'opacity-100' : 'opacity-40 hover:cursor-pointer hover:opacity-100'}`}
                    />
                </>
            )}
        </div>
    )
}


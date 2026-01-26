"use client"
import { gradeStudentResponse } from "@/lib/actions/response.action";
import { useState, useEffect } from "react";
import { BarLoader } from "react-spinners"
import { useQueryClient } from "@tanstack/react-query";
import { PromptSession, Response, ResponseData } from "@/types";
import { JsonValue } from "@prisma/client/runtime/library";
import { useTheme } from "next-themes";

export default function GradingPanel({
    responseId,
    questionNumber,
    updateScoreUIHandler,
    currentScore,
    updateUIQuestionAccordion,
    teacherId,
    sessionId,
    isInModal = false
}: {
    responseId: string;
    questionNumber: number;
    updateScoreUIHandler?: (questionNumber: number, score: number) => void;
    updateUIQuestionAccordion?: (newScore: number) => void;
    currentScore: number;
    teacherId: string;
    sessionId: string;
    isInModal?: boolean;
}) {

    const [isGrading, setIsGrading] = useState<boolean>(false)
    const [currentScoreState, setCurrentScoreState] = useState<number>(currentScore)
    const queryClient = useQueryClient();
    const { theme } = useTheme();

    // Get theme color dynamically for BarLoader (only accepts hex)
    const [loaderColor, setLoaderColor] = useState('#a67c52');

    useEffect(() => {
        // Wait for next frame to ensure CSS has been applied
        requestAnimationFrame(() => {
            const primaryColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--primary')
                .trim();
            if (primaryColor) {
                setLoaderColor(primaryColor);
            }
        });
    }, [theme]); // Re-run when theme changes

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
            console.error('error updating score ', error)
        } finally {
            setIsGrading(false)
        }
    }

    return (
        <div className="flex w-full justify-center items-center">
            {isGrading && loaderColor ? (
                <BarLoader
                    color={loaderColor}
                    width={190}
                    height={10}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                    className="py-5"
                />
            ) : (
                <div className="flex w-full rounded-md">
                    {/* Incorrect */}
                    <button
                        type="button"
                        aria-label="Mark Incorrect"
                        onClick={() => { if (currentScoreState !== 0) updateResponseScore(0) }}
                        className={`
                        flex-1 flex flex-col items-center justify-center
                        bg-destructive text-destructive-foreground
                        ${isInModal ? 'rounded-bl-md' : 'rounded-l-md'}
                        h-10 min-w-[44px] text-lg font-bold
                        transition-all duration-150
                        ${currentScoreState === 0 ? 'opacity-100 shadow-lg' : 'opacity-50 hover:opacity-100 hover:cursor-pointer'}
                        
                    `}
                    >
                        {/* <X size={32} /> */}
                        <span className="text-xs mt-1">Incorrect</span>
                    </button>
                    {/* Half Credit */}
                    <button
                        type="button"
                        aria-label="Mark Half Credit"
                        onClick={() => { if (currentScoreState !== 0.5) updateResponseScore(0.5) }}
                        className={`
                        flex-1 flex flex-col items-center justify-center
                        bg-warning text-warning-foreground
                        h-10 min-w-[44px] text-lg font-bold
                        transition-all duration-150
                        ${currentScoreState === 0.5 ? 'opacity-100 shadow-lg' : 'opacity-50 hover:opacity-100 hover:cursor-pointer'}
                        
                    `}
                    >
                        {/* Custom SVG for half credit */}
                        {/* <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 50 50">
                            <text x="37%" y="30%" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="22" fontWeight={600} fill="white">1</text>
                            <line x1="12" y1="40" x2="40" y2="9" stroke="white" strokeWidth="3" />
                            <text x="66%" y="80%" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="22" fontWeight={600} fill="white">2</text>
                        </svg> */}
                        <span className="text-xs mt-1">Half Credit</span>
                    </button>
                    {/* Correct */}
                    <button
                        type="button"
                        aria-label="Mark Correct"
                        onClick={() => { if (currentScoreState !== 1) updateResponseScore(1) }}
                        className={`
                        flex-1 flex flex-col items-center justify-center
                        bg-success text-success-foreground
                        ${isInModal ? 'rounded-br-md' : 'rounded-r-md'}
                        h-10 min-w-[44px] text-lg font-bold
                        transition-all duration-150
                        ${currentScoreState === 1 ? 'opacity-100 shadow-lg' : 'opacity-50 hover:opacity-100 hover:cursor-pointer'}
                    
                    `}
                    >
                        {/* <Check size={32} /> */}
                        <span className="text-xs mt-1">Correct</span>
                    </button>
                </div>
            )}
        </div>
    )
}


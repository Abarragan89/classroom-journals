'use client'
import { Response, Question } from "@/types";
import { useState } from "react";
import { StudentDataBarChart } from "./student-data-bar-chart";
import QuestionAccordion from "./question-accordion";

export default function DataClientWrapper({
    questions,
    responses,
    teacherId,
    sessionId,
}: {
    questions: Question[];
    responses: Response[];
    sessionId: string;
    teacherId: string
}) {

    const [currentQuestions, setCurrentQuestions] = useState<{ start: number, end: number }>({ start: 0, end: questions.length >= 4 ? 4 : questions.length })

    function nextQuestionSet() {
        if (currentQuestions.end >= questions.length) return
        setCurrentQuestions(prev => ({
            start: prev.end,
            end: prev.end + 4 > questions.length ? questions.length : prev.end + 4
        }))
    }

    function backQuestionSet() {
        if (currentQuestions.start <= 0) return
        setCurrentQuestions(prev => ({
            start: prev.start - 4 <= 0 ? 0 : prev.start - 4,
            end: prev.end - 4
        }))
    }

    return (
        <div className="mb-10">
            <div className="flex flex-col lg:flex-row lg:items-start mt-5 gap-5">
                <div className="flex-1 w-full">
                    <StudentDataBarChart
                        responses={responses as Response[]}
                        startRange={currentQuestions.start}
                        endRange={currentQuestions.end}
                        onNext={nextQuestionSet}
                        onPrevious={backQuestionSet}
                        totalQuestions={questions.length}
                    />
                </div>
                <div className="flex-1 w-full">
                    <QuestionAccordion
                        questions={(questions as unknown as Question[]) as unknown as Question[]}
                        responses={responses as unknown as Response[]}
                        startRange={currentQuestions.start}
                        endRange={currentQuestions.end}
                        teacherId={teacherId}
                        sessionId={sessionId}
                    />
                </div>
            </div>
        </div>
    )
}

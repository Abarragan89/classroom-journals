'use client'
import { Response, Question } from "@/types";
import { useState } from "react";
import { StudentDataBarChart } from "./student-data-bar-chart";
import QuestionAccordion from "./question-accordion";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

export default function DataClientWrapper({
    questions,
    responses,
}: {
    questions: Question[];
    responses: Response[];
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

    const chevronStyles = 'hover:cursor-pointer hover:text-input border border-border rounded-sm hover:bg-primary hover:text-foreground';

    

    return (
        <div className="mb-10">
            <div className="flex-start mt-5 gap-x-5 mb-3">
                <p className="font-bold">Questions: {currentQuestions.start + 1} - {currentQuestions.end}</p>
                <p className={chevronStyles} onClick={backQuestionSet}>
                    <BiChevronLeft size={25} />
                </p>
                <p className={chevronStyles} onClick={nextQuestionSet}>
                    < BiChevronRight size={25} />
                </p> 
            </div>
            <div className="flex flex-col lg:flex-row lg:items-start ">
                <div className="flex-1 w-[95%] mx-auto">
                    <StudentDataBarChart
                        responses={responses as Response[]}
                        startRange={currentQuestions.start}
                        endRange={currentQuestions.end}
                    />
                </div>
                <div className="flex-1 p-0 w-[95%] mt-10 sm:px-5 mx-auto lg:mt-0">
                    <QuestionAccordion
                        questions={(questions as unknown as Question[]) as unknown as Question[]}
                        responses={responses as unknown as Response[]}
                        startRange={currentQuestions.start}
                        endRange={currentQuestions.end}
                    />
                </div>
            </div>
        </div>
    )
}

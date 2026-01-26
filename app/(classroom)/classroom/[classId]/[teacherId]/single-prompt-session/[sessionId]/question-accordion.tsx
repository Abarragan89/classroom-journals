'use client';
import { useEffect, useState, useRef } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Question, Response, ResponseData } from "@/types";
import GradingPanel from "@/components/grading-panel";

interface ResponseDetail {
    answer: string;
    studId: string;
    studName?: string;
    responseId: string;
}

type ScoreGroup = {
    [score: number]: ResponseDetail[];
};

interface OrganizedResponses {
    [question: string]: ScoreGroup;
}

export default function QuestionAccordion({
    questions,
    responses,
    startRange,
    endRange,
    teacherId,
    sessionId
}: {
    questions: Question[];
    responses: Response[];
    startRange: number;
    endRange: number;
    teacherId: string;
    sessionId: string;
}) {
    const [currentResponseData, setCurrentResponseData] = useState<OrganizedResponses>({});
    const currentSubQuery = useRef<{ question: string; score: number, questionNumber: number }>({
        question: "",
        score: 0,
        questionNumber: 0
    });

    const [isResponseViewModalOpen, setIsResponseViewModalOpen] = useState<boolean>(false);

    useEffect(() => {
        function organizeQuestionResponses() {
            const responseObj: OrganizedResponses = {};
            responses?.forEach((stuResp: Response) => {
                (stuResp?.response as unknown as ResponseData[]).forEach((responseData: ResponseData) => {
                    const { question, score, answer } = responseData;
                    let adjustedScore = score
                    if (isNaN(score)) {
                        adjustedScore = 2
                    }
                    if (!responseObj[question]) {
                        // The key '2' means not graded. (negative one wouldn't work)
                        responseObj[question] = { 2: [], 0: [], 0.5: [], 1: [] };
                    }
                    responseObj[question][adjustedScore]?.push({
                        responseId: stuResp.id,
                        answer: answer,
                        studId: stuResp.student.id,
                        studName: stuResp.student.username,
                    });
                }
                );
            });
            setCurrentResponseData(responseObj);
        }

        organizeQuestionResponses();
    }, [responses]); // Dependency array ensures this runs when 'responses' change

    function handleShowModal(question: string, score: number, questionNumber: number) {
        currentSubQuery.current = { question, score, questionNumber };
        setIsResponseViewModalOpen(true);
    }

    const scoreLabelMap: Record<number | string, { text: string; color: string }> = {
        1: { text: 'Correct Responses', color: 'text-success' },
        0.5: { text: 'Half Credit Responses', color: 'text-warning' },
        0: { text: 'Wrong Responses', color: 'text-destructive' },
        default: { text: 'Not Graded', color: 'text-muted-foreground' }
    };

    const score = currentSubQuery.current.score;
    const label = scoreLabelMap[score as keyof typeof scoreLabelMap] ?? scoreLabelMap.default;

    return (
        <>
            <ResponsiveDialog
                title={``}
                isOpen={isResponseViewModalOpen}
                setIsOpen={setIsResponseViewModalOpen}
            >
                {/* show currrent question and the current score for responses */}
                <div className="relative">
                    <p className={`absolute font-bold ${label.color} text-center mt-[-15px] text-sm`}>
                        {label.text}
                    </p>
                    <p className="text-center my-5 font-medium italic w-[97%] mx-auto">{currentSubQuery.current.question}</p>
                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar space-y-6 rounded-md shadow-md">
                        {currentResponseData?.[currentSubQuery.current.question]?.[currentSubQuery.current.score]?.map((data) => (
                            <div key={data.responseId} className="bg-card border rounded-md text-sm relative shadow-md">
                                <p className="bg-muted text-muted-foreground py-1 text-center font-bold">{data?.studName}</p>
                                <p
                                    className="p-5 font-bold"
                                >
                                    {data?.answer || 'No answer provided.'}
                                </p>
                                <GradingPanel
                                    responseId={data.responseId}
                                    questionNumber={currentSubQuery.current.questionNumber}
                                    currentScore={currentSubQuery.current.score}
                                    teacherId={teacherId}
                                    sessionId={sessionId}
                                    isInModal={true}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </ResponsiveDialog>

            <div className="border border-border rounded-md p-4 bg-card">
                {/* Header Section */}
                <div className="mb-4">
                    <h3 className="font-bold text-lg mb-1">Student Responses by Question</h3>
                    {/* <p className="text-sm text-muted-foreground">Click a question to view student responses grouped by score</p> */}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-border text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded bg-muted"></div>
                        <span className="text-muted-foreground">Not Graded</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded bg-destructive"></div>
                        <span className="text-muted-foreground">Incorrect</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded bg-warning"></div>
                        <span className="text-muted-foreground">Half Credit</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded bg-success"></div>
                        <span className="text-muted-foreground">Correct</span>
                    </div>
                </div>

                {/* Accordion */}
                <Accordion type="single" collapsible defaultValue={questions?.[0]?.question}>
                    {questions?.length > 0 &&
                        questions?.slice(startRange, endRange)?.map((question: Question, index: number) => (
                            <AccordionItem key={index} value={question.question}>
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-start gap-2 text-left">
                                        <span className="font-semibold text-primary shrink-0">Q{startRange + index + 1}.</span>
                                        <span className="line-clamp-2">{question.question}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-3 italic">Click a badge to view student responses</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            <button
                                                onClick={() => handleShowModal(question.question, 2, startRange + index)}
                                                className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-muted bg-muted/10 hover:bg-muted/20 transition-colors group"
                                            >
                                                <span className="text-2xl font-bold text-muted-foreground group-hover:scale-110 transition-transform">
                                                    {currentResponseData[question.question]?.[2]?.length || 0}
                                                </span>
                                                <span className="text-xs text-muted-foreground mt-1">Not Graded</span>
                                            </button>

                                            <button
                                                onClick={() => handleShowModal(question.question, 0, startRange + index)}
                                                className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors group"
                                            >
                                                <span className="text-2xl font-bold text-destructive group-hover:scale-110 transition-transform">
                                                    {currentResponseData[question.question]?.[0]?.length || 0}
                                                </span>
                                                <span className="text-xs text-muted-foreground mt-1">Incorrect</span>
                                            </button>

                                            <button
                                                onClick={() => handleShowModal(question.question, 0.5, startRange + index)}
                                                className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-warning bg-warning/10 hover:bg-warning/20 transition-colors group"
                                            >
                                                <span className="text-2xl font-bold text-warning group-hover:scale-110 transition-transform">
                                                    {currentResponseData[question.question]?.[0.5]?.length || 0}
                                                </span>
                                                <span className="text-xs text-muted-foreground mt-1">Half Credit</span>
                                            </button>

                                            <button
                                                onClick={() => handleShowModal(question.question, 1, startRange + index)}
                                                className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-success bg-success/10 hover:bg-success/20 transition-colors group"
                                            >
                                                <span className="text-2xl font-bold text-success group-hover:scale-110 transition-transform">
                                                    {currentResponseData[question.question]?.[1]?.length || 0}
                                                </span>
                                                <span className="text-xs text-muted-foreground mt-1">Correct</span>
                                            </button>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                </Accordion>
            </div>
        </>
    );
}

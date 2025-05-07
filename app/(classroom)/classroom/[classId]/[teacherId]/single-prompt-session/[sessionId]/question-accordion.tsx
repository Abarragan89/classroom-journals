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
}: {
    questions: Question[];
    responses: Response[];
    startRange: number;
    endRange: number;
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

    const circleBtnStyles = "text-background rounded-lg w-full mx-1 h-8 flex-center opacity-70 hover:cursor-pointer hover:opacity-100";

    const scoreLabelMap: Record<number | string, { text: string; color: string }> = {
        1: { text: 'Correct Responses', color: 'text-success' },
        0.5: { text: 'Half Credit Responses', color: 'text-warning' },
        0: { text: 'Wrong Responses', color: 'text-destructive' },
        default: { text: 'Not Graded', color: 'text-input' }
    };

    const score = currentSubQuery.current.score;
    const label = scoreLabelMap[score as keyof typeof scoreLabelMap] ?? scoreLabelMap.default;

    // Update the UI when updating grades in the modal
    function handleScoreUpdateUI(
        responseId: string,
        oldScore: number,
        question: string,
        newScore: number,
    ) {
        setCurrentResponseData((prev) => {
            // Clone previous state to avoid direct mutation
            const updated = { ...prev };

            // Defensive check
            if (!updated[question]) return prev

            // Clone the score groups
            const questionScores = { ...updated[question] };

            // Remove the response from the old score group
            questionScores[oldScore] = questionScores[oldScore].filter(
                (resp) => resp.responseId !== responseId
            );

            // Find the response object to move
            const allResponses = Object.values(prev[question]).flat();
            const responseToMove = allResponses.find((resp) => resp.responseId === responseId);

            // If found, push it to the new score group
            if (responseToMove) {
                if (!questionScores[newScore]) {
                    questionScores[newScore] = [];
                }
                // prevents duplicates
                const alreadyExists = questionScores[newScore].some(
                    (resp) => resp.responseId === responseId
                );
                if (!alreadyExists) {
                    questionScores[newScore].push(responseToMove);
                }
            }
            return {
                ...prev,
                [question]: questionScores,
            };
        });
    }
    return (
        <>
            <ResponsiveDialog
                title={``}
                isOpen={isResponseViewModalOpen}
                setIsOpen={setIsResponseViewModalOpen}
            >
                {/* show currrent question and the current score for responses */}
                <p className="text-center font-bold w-[97%] mx-auto">{currentSubQuery.current.question}</p>
                <p className={`font-bold ${label.color} text-center mt-[-15px] text-sm`}>
                    {label.text}
                </p>
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                    {currentResponseData?.[currentSubQuery.current.question]?.[currentSubQuery.current.score]?.map((data, index) => (
                        <div key={index} className="bg-card px-5 mx-3 pt-3 pb-14 my-4 rounded-md text-sm relative">
                            <p
                            >
                                {data.answer}
                            </p>
                            <span className="absolute bottom-1 right-5 text-input text-xs">-{data.studName}</span>
                            <div className="absolute bottom-1 left-5">
                                <GradingPanel
                                    responseId={data.responseId}
                                    questionNumber={currentSubQuery.current.questionNumber}
                                    currentScore={currentSubQuery.current.score}
                                    updateUIQuestionAccordion={(newScore) =>
                                        handleScoreUpdateUI(
                                            data.responseId,
                                            currentSubQuery.current.score,
                                            currentSubQuery.current.question,
                                            newScore
                                        )
                                    }
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </ResponsiveDialog>

            <Accordion type="single" collapsible>
                {/* <h3 className="text-sm font-bold text-center">View responses by question</h3> */}
                {questions?.length > 0 &&
                    questions?.slice(startRange, endRange)?.map((question: Question, index: number) => (
                        <AccordionItem key={index} value={question.question}>
                            <AccordionTrigger>
                                <p className="line-clamp-1 pr-10">{`Q: ${startRange + index + 1}`} <span className="ml-2 block-inline">{question.question}</span></p>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="flex justify-around text-xl mt-3">
                                    <div
                                        onClick={() => handleShowModal(question.question, 2, startRange + index)}
                                        className={`bg-input ${circleBtnStyles}`}
                                    >
                                        <p>{currentResponseData[question.question]?.[2]?.length}</p>
                                    </div>
                                    <div
                                        onClick={() => handleShowModal(question.question, 0, startRange + index)}
                                        className={`bg-destructive ${circleBtnStyles}`}
                                    >
                                        <p>{currentResponseData[question.question]?.[0]?.length}</p>
                                    </div>
                                    <div
                                        onClick={() => handleShowModal(question.question, 0.5, startRange + index)}
                                        className={`bg-warning ${circleBtnStyles}`}
                                    >
                                        <p>{currentResponseData[question.question]?.[0.5]?.length}</p>
                                    </div>
                                    <div
                                        onClick={() => handleShowModal(question.question, 1, startRange + index)}
                                        className={`bg-success ${circleBtnStyles}`}
                                    >
                                        <p>{currentResponseData[question.question]?.[1]?.length}</p>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
            </Accordion>
        </>
    );
}

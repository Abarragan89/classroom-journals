"use client";
import { ResponseData } from "@/types";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import SaveAndContinueBtns from "@/components/buttons/save-and-continue";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowBigLeft } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitStudentResponse, updateStudentResponse } from "@/lib/actions/response.action";
import { toast } from "sonner";
import Editor from "./editor";
import MultiQuestionReview from "@/app/(student)/response-review/[responseId]/multi-question-review";
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function MultipleQuestionEditor({
    studentResponse,
    isTeacherPremium,
    gradeLevel,
    responseId,
    spellCheckEnabled,
    studentId
}: {
    studentResponse: ResponseData[]
    isTeacherPremium: boolean,
    gradeLevel: string
    responseId: string;
    spellCheckEnabled: boolean;
    studentId: string;
}) {

    const searchParams = useSearchParams();
    const questionNumber: string | number = searchParams.get('q') as string;
    const router = useRouter();;
    const [journalText, setJournalText] = useState<string>("");
    const [studentResponseData, setStudentResponseData] = useState<ResponseData[]>(studentResponse);
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [showConfetti, setShowConfetti] = useState<boolean>(false)
    const [isAssignmentCollected, setIsAssignmentCollected] = useState<boolean>(false)
    const { width, height } = useWindowSize()

    const [state, action] = useActionState(submitStudentResponse, {
        success: false,
        message: ''
    })

    useEffect(() => {
        if (state?.success) {
            setShowConfetti(true)
        }
    }, [state?.success])

    // This runs on every new page
    useEffect(() => {
        if (questionNumber && studentResponseData) {
            setCurrentQuestion(studentResponseData?.[Number(questionNumber)]?.question)
            setJournalText(studentResponseData?.[Number(questionNumber)]?.answer ?? '')
        }
    }, [questionNumber, studentResponseData])

    /** Auto-save logic */
    useEffect(() => {
        if (!isTyping) return
        if (isTyping) {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(async () => {
                setIsTyping(false);
                await handleSaveResponses();
            }, 15000); // Save after 15 seconds of inactivity
        }
        return () => clearTimeout(typingTimeoutRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [journalText, isTyping]);


    // Go into fullscreen mode
    useEffect(() => {
        const goFullScreen = async () => {
            if (typeof window !== "undefined" && document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        };
        goFullScreen().catch((err) => console.warn("Fullscreen request failed:", err));
    }, []);


    // I need to check to see if the Response is marked as complete, if so, send to home page
    async function handleSaveResponses() {
        if (isSaving) return
        try {
            setIsSaving(true);
            const updatedAnswer = journalText.trimEnd();
            const updatedData = studentResponseData.map((q, index) =>
                index === Number(questionNumber)
                    ? { ...q, answer: updatedAnswer }
                    : q
            );
            setStudentResponseData(updatedData)

            const result = await updateStudentResponse(updatedData, responseId, studentId);

            // Handle collected assignment
            if (result?.isCollected) {
                // Show modal and redirect
                setIsAssignmentCollected(true);
                // router.push('/student-dashboard');
                // toast.error('This assignment has been collected');
                return;
            }

            // Handle other errors
            if (!result?.success) {
                toast.error(result?.message || 'Failed to save');
            }
        } catch (error) {
            console.error('error saving response', error);
            toast.error('Failed to save');
        } finally {
            setIsSaving(false);
        }
    }

    async function saveAndContinue(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsTyping(false)
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        if (journalText === '') {
            toast.error('Add Some Text!', {
                style: { background: 'hsl(0 84.2% 60.2%)', color: 'white' }
            });
            return
        }
        try {
            await handleSaveResponses();
            const nextQuestion = (Number(questionNumber) + 1).toString()
            router.push(`/jot-response/${responseId}?q=${nextQuestion}`)
        } catch (error) {
            console.error('error saving and continuing ', error)
        }
    }

    const SubmitFormBtn = () => {
        const { pending } = useFormStatus()
        return (
            <Button disabled={pending} variant='default' type="submit">
                {pending ? 'Submitting...' : 'Submit'}
            </Button>
        )
    }

    if (showConfetti && width && height) {
        return (
            <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <Confetti
                    width={width}
                    height={height}
                    numberOfPieces={1000}
                    recycle={false}
                    gravity={0.3}
                    tweenDuration={2000}
                    initialVelocityY={20}
                    initialVelocityX={5}
                    wind={0.01}
                    friction={0.99}
                />
                <div className="w-[370px] mt-4 bg-card text-card-foreground rounded-xl p-6 shadow-lg text-center z-40 animate-fall border">
                    <p className="text-primary font-bold text-xl text-center">Answers Submitted!</p>
                    <Button asChild className="mt-4">
                        <Link href={'/'}>
                            Finish
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <>
            <Dialog open={isAssignmentCollected}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assignment Collected</DialogTitle>
                    </DialogHeader>
                    <p className="my-3">Your teacher has collected this assignment. You can no longer edit your answers.</p>
                    <Button onClick={() => router.push("/student-dashboard")}>
                        Go to Dashboard
                    </Button>
                </DialogContent>
            </Dialog>


            {/* If finished the last question, show answer review */}
            <div className="w-full max-w-[1000px] mx-auto relative">
                <div className="flex-between">
                    <div className="flex-center hover:cursor-pointer hover:text-primary"
                        onClick={() => {
                            router.back();
                            if (typingTimeoutRef.current) {
                                clearTimeout(typingTimeoutRef.current);
                            }
                        }}>
                        <ArrowBigLeft size={30} />
                        <p className="ml-2 text-md">Back</p>
                    </div>
                    <Badge className="text-sm">Assessment</Badge>
                </div>
                {Number(questionNumber) === studentResponse.length ? (
                    <div className="mt-10">
                        <MultiQuestionReview
                            allQuestions={studentResponseData as ResponseData[]}
                            setAllQuestions={setStudentResponseData}
                            // to show Question Review title instead of Assessment title
                            isQuestionReview={true}
                            isSubmittable={true}
                            showGrades={false}
                            isTeacherPremium={isTeacherPremium}
                            gradeLevel={gradeLevel}
                            spellCheckEnabled={spellCheckEnabled}
                            studentId={studentId}
                        />
                        <div className="flex flex-col justify-center items-center">
                            <p className="text-center mt-10 tracking-wider mb-5 text-xl font-bold">Ready to Submit?</p>
                            {/* Final form to submit responses to database */}
                            <form action={action} className="mt-5">
                                <input
                                    id="responseId"
                                    name="responseId"
                                    value={responseId}
                                    hidden
                                    readOnly
                                />
                                <input
                                    id="promptType"
                                    name="promptType"
                                    value='ASSESSMENT'
                                    hidden
                                    readOnly
                                />
                                <input
                                    id="responseData"
                                    name="responseData"
                                    value={JSON.stringify(studentResponseData)}
                                    hidden
                                    readOnly
                                />
                                <input
                                    id="grade-level"
                                    name="grade-level"
                                    value={gradeLevel === null ? '' : gradeLevel}
                                    hidden
                                    readOnly
                                />
                                <input
                                    id="is-teacher-premium"
                                    name="is-teacher-premium"
                                    value={isTeacherPremium ? 'true' : 'false'}
                                    hidden
                                    readOnly
                                />
                                <input
                                    id="studentId"
                                    name="studentId"
                                    value={studentId}
                                    hidden
                                    readOnly
                                />
                                <div className="flex-center gap-x-7">
                                    <Button onClick={() => { handleSaveResponses(); toast('Answers Saved!') }} variant='secondary' type="button">Save</Button>
                                    <SubmitFormBtn />
                                </div>
                            </form>
                        </div>

                    </div>
                ) : (
                    // IF not final question, just show the editor and question with continue buttons
                    <div className="mt-20">
                        <Editor
                            questionText={currentQuestion}
                            setJournalText={setJournalText}
                            journalText={journalText}
                            spellCheckEnabled={spellCheckEnabled}
                            setIsTyping={setIsTyping}
                            questionNumber={Number(questionNumber) + 1}
                            totalQuestions={studentResponse.length}
                        />
                        <div className="flex flex-col justify-center items-center mt-10">
                            <form onSubmit={(e) => saveAndContinue(e)}>
                                <SaveAndContinueBtns
                                    isSaving={isSaving}
                                    submitHandler={() => { handleSaveResponses(); toast('Answers Saved!') }}
                                />
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

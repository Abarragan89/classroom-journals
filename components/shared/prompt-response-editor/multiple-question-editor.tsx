"use client";
import { ResponseData } from "@/types";
import { useState, useRef, useEffect } from "react";
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

export default function MultipleQuestionEditor({
    studentResponse,
    isTeacherPremium,
    gradeLevel,
    responseId
}: {
    studentResponse: ResponseData[]
    isTeacherPremium: boolean,
    gradeLevel: string
    responseId: string
}) {

    const searchParams = useSearchParams();
    const questionNumber: string | number = searchParams.get('q') as string;
    const router = useRouter();
    const inputRef = useRef<HTMLDivElement>(null);
    const [journalText, setJournalText] = useState<string>("");
    const [studentResponseData, setStudentResponseData] = useState<ResponseData[]>(studentResponse);
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const [state, action] = useActionState(submitStudentResponse, {
        success: false,
        message: ''
    })

    useEffect(() => {
        if (state?.success) {
            async function finishResponseHandler() {
                router.push('/')
                toast('Answers Submitted!')
            }
            finishResponseHandler()
        }
    }, [state.success])

    // This runs on every new page
    useEffect(() => {
        if (questionNumber && studentResponseData) {
            setCurrentQuestion(studentResponseData?.[Number(questionNumber)]?.question)
            setJournalText(studentResponseData?.[Number(questionNumber)]?.answer ?? '')
            inputRef.current?.focus()
        }
    }, [questionNumber, studentResponseData])

    // /** Auto-save logic */
    useEffect(() => {
        if (!isTyping) return
        if (isTyping) {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(async () => {
                await handleSaveResponses();
                setIsTyping(false);
                inputRef.current?.focus()
            }, 5000); // Save after 5 seconds of inactivity
        }
        return () => clearTimeout(typingTimeoutRef.current);
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


    async function handleSaveResponses() {
        if (isSaving) return
        try {
            setIsSaving(true);
            const updatedAnswer = journalText.trim();
            const updatedData = studentResponseData.map((q, index) =>
                index === Number(questionNumber)
                    ? { ...q, answer: updatedAnswer }
                    : q
            );
            // Update the state
            // setStudentResponseData(updatedData);
            // Call the server action with the updated data
            await updateStudentResponse(updatedData, responseId);
        } catch (error) {
            console.log('error saving to indexed db', error);
        } finally {
            setIsSaving(false);
        }
    }

    async function saveAndContinue(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
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
            setJournalText('');
        } catch (error) {
            console.log('error saving and continuing ', error)
        } finally {
            inputRef?.current?.focus()
        }
    }

    const SubmitFormBtn = () => {
        const { pending } = useFormStatus()
        return (
            <Button disabled={pending} className="w-full" variant='default' type="submit">
                {pending ? 'Submitting...' : 'Submit'}
            </Button>
        )
    }

    if (questionNumber === 'blog-details') {
        return (
            <p>Add title and image</p>
        )
    }

    return (
        <div className="w-full max-w-[900px] mx-auto relative px-5 mb-32">
            {/* If finished the last question, show answer review */}
            <div className="flex-start absolute -top-16 left-0 hover:cursor-pointer hover:text-accent" onClick={() => router.back()}>
                <ArrowBigLeft className="" />
                <p className="ml-1 text-md">Back</p>
            </div>
            {Number(questionNumber) === studentResponse.length ? (
                <div className="mt-16">
                    <MultiQuestionReview
                        allQuestions={studentResponseData as ResponseData[]}
                        setAllQuestions={setStudentResponseData}
                        isSubmittable={true}
                        showGrades={false}
                        isTeacherPremium={isTeacherPremium}
                        gradeLevel={gradeLevel}

                    />
                    <div className="flex flex-col justify-center items-center">
                        <p className="text-center font-bold">Ready to Submit?</p>
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
                                value={gradeLevel}
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
                            <div className="flex-center gap-x-7">
                                <Button onClick={() => { handleSaveResponses(); toast('Answers Saved!') }} variant='secondary' type="button">Save</Button>
                                <SubmitFormBtn />
                            </div>
                        </form>
                    </div>

                </div>
            ) : (
                // IF not final question, just show the editor and question with continue buttons
                <>
                    <p className="absolute -top-16 right-0 text-sm">Question: {Number(questionNumber) + 1} / {studentResponse.length}</p>
                    <p className="mt-16 mb-5 w-full mx-auto whitespace-pre-line text-left lg:text-lg">{currentQuestion}</p>
                    <Editor
                        setJournalText={setJournalText}
                        journalText={journalText}
                        inputRef={inputRef}
                        setIsTyping={setIsTyping}
                    />
                    <form onSubmit={(e) => saveAndContinue(e)}>
                        <SaveAndContinueBtns
                            isSaving={isSaving}
                            submitHandler={() => { handleSaveResponses(); toast('Answers Saved!') }}
                        />
                    </form>
                </>
            )}
        </div>
    );
}

"use client";
import { Question } from "@/types";
import { useState, useRef, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import SaveAndContinueBtns from "@/components/buttons/save-and-continue";
import { saveFormData, getFormData, deleteRow } from "@/lib/indexed.db.actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowBigLeft } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createStudentResponse } from "@/lib/actions/response.action";
import { toast } from "sonner";
import Editor from "./editor";

export default function MultipleQuestionEditor({
    questions,
    studentId,
}: {
    questions: Question[],
    studentId: string,
}) {

    const searchParams = useSearchParams();
    const questionNumber: string | number = searchParams.get('q') as string;
    const { promptSessionId } = useParams();
    const router = useRouter();
    const inputRef = useRef<HTMLDivElement>(null);
    const [journalText, setJournalText] = useState<string>("");
    const [cursorIndex, setCursorIndex] = useState<number>(0);
    const [allQuestions, setAllQuestions] = useState<Question[]>(questions);
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [confirmSubmission, setConfirmSubmission] = useState<boolean>(false);
    // const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const [state, action] = useActionState(createStudentResponse, {
        success: false,
        message: ''
    })

    useEffect(() => {
        if (state?.success) {
            async function finishResponseHandler() {
                // deleltes row in indexedDB
                await deleteRow(promptSessionId as string)
                router.replace('/')
                toast('Answers Submitted!')
            }
            finishResponseHandler()
        }
    }, [state.success])



    async function getSavedText() {
        try {
            const savedResponse = await getFormData(promptSessionId as string)
            const isThereResponse = savedResponse.questions[Number(questionNumber)].answer
            const savedText = savedResponse.questions[Number(questionNumber)].answer || "";
            setCursorIndex(savedText.length);

            if (!savedResponse || !isThereResponse) {
                return
            }
            setAllQuestions(savedResponse.questions)
            setJournalText(savedResponse.questions[Number(questionNumber)].answer);
        } catch (error) {
            console.log('error getting saved data in indexedb', error)
        }
    }
    // This runs on every new page
    useEffect(() => {
        if (questionNumber && questions) {
            setCurrentQuestion(questions[Number(questionNumber)]?.question)
            getSavedText()
            setJournalText('')
            inputRef.current?.focus()
        }
    }, [questionNumber, questions])

    // /** Auto-save logic */
    // useEffect(() => {
    //     if (!isTyping) return
    //     if (isTyping) {
    //         if (typingTimeoutRef.current) {
    //             clearTimeout(typingTimeoutRef.current);
    //         }
    //         // typingTimeoutRef.current = setTimeout(() => {
    //         //     handleSaveResponses();
    //         //     setIsTyping(false);
    //         // }, 5000); // Save after 5 seconds of inactivity
    //     }
    //     return () => clearTimeout(typingTimeoutRef.current);
    // }, [journalText, isTyping]);


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
        try {
            setIsSaving(true);
            const updatedQuestions = allQuestions.map((q, index) =>
                index === Number(questionNumber)
                    ? { question: currentQuestion, answer: journalText.trim() }
                    : q
            );
            // Save immediately after updating questions
            setAllQuestions(updatedQuestions);
            await saveFormData(updatedQuestions, promptSessionId);
            if (typingTimeoutRef?.current) clearTimeout(typingTimeoutRef.current);
        } catch (error) {
            console.log('error saving to indexed db', error);
        } finally {
            setIsSaving(false);
        }
    }

    async function saveAndContinue(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            await handleSaveResponses();
            const nextQuestion = (Number(questionNumber) + 1).toString()
            router.push(`/jot-response/${promptSessionId}?q=${nextQuestion}`)
            inputRef.current?.focus()
            if (typingTimeoutRef?.current) clearTimeout(typingTimeoutRef.current);
            setJournalText('');
        } catch (error) {
            console.log('error saving and continuing ', error)
        }
    }

    const SubmitFormBtn = () => {
        const { pending } = useFormStatus()
        return (
            <Button disabled={pending} className="w-full" variant='default'>
                {pending ? 'Submitting...' : 'Confirm Submission'}
            </Button>
        )
    }

    if (questionNumber === 'blog-details') {
        return (
            <p>Add title and image</p>
        )
    }

    return (
        <div className="w-full max-w-[900px] mx-auto relative px-5">
            <p className="absolute -top-16 right-0 text-sm">Question: {Number(questionNumber) + 1} / {questions.length}</p>
            <ArrowBigLeft className="absolute -top-16 left-0 text-sm hover:cursor-pointer hover:text-accent" onClick={() => router.back()} />
            <p className="h3-bold mt-16 mb-5 w-full mx-auto text-center">{currentQuestion}</p>
            <Editor
                setJournalText={setJournalText}
                journalText={journalText}
                // setIsTyping={setIsTyping}
                cursorIndex={cursorIndex}
                setCursorIndex={setCursorIndex}
                inputRef={inputRef}
            />

            {/* Save and Submit Buttons */}
            {/* Check to see if user is on last page */}
            {Number(questionNumber) === questions.length - 1 ? (
                // If last question and user is 
                confirmSubmission ? (
                    <div className="flex flex-col justify-center items-center">
                        <p className="text-center text-destructive font-bold">Are you sure you want to submit all your answers?</p>
                        <form action={action} className="mt-5">
                            <input
                                id="studentId"
                                name="studentId"
                                value={studentId}
                                hidden
                                readOnly
                            />
                            <input
                                id="promptSessionId"
                                name="promptSessionId"
                                value={promptSessionId}
                                hidden
                                readOnly
                            />
                            <input
                                id="responseData"
                                name="responseData"
                                value={JSON.stringify(allQuestions)}
                                hidden
                                readOnly
                            />
                            <div className="flex-center gap-x-7">
                                <Button variant='secondary' type="button">Cancel</Button>
                                <SubmitFormBtn />
                            </div>
                        </form>
                    </div>

                ) : (
                    <div className="flex flex-col justify-center items-center">
                        <p className="text-center mb-3 font-bold">Ready to submit?</p>
                        <div className="flex-center gap-5">
                            <Button variant='secondary' onClick={() => { handleSaveResponses(); toast('Answers Saved!') }} className="flex justify-center mx-auto">Save</Button>
                            <Button onClick={() => { setConfirmSubmission(true); handleSaveResponses() }}>Submit Responses</Button>
                        </div>
                    </div>
                )
            ) : (
                <form onSubmit={(e) => saveAndContinue(e)}>
                    <SaveAndContinueBtns
                        isSaving={isSaving}
                        submitHandler={() => { handleSaveResponses(); toast('Answers Saved!') }}
                    />
                </form>

            )}
        </div>
    );
}

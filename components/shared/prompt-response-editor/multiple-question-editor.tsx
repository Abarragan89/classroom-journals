"use client";
import { ResponseData } from "@/types";
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
import MultiQuestionReview from "@/app/(student)/response-review/[responseId]/multi-question-review";

export default function MultipleQuestionEditor({
    questions,
    studentId,
}: {
    questions: ResponseData[],
    studentId: string,
}) {

    const searchParams = useSearchParams();
    const questionNumber: string | number = searchParams.get('q') as string;
    const { promptSessionId } = useParams();
    const router = useRouter();
    const inputRef = useRef<HTMLDivElement>(null);
    const [journalText, setJournalText] = useState<string>("");
    const [allQuestions, setAllQuestions] = useState<ResponseData[]>(questions);
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    // const [isTyping, setIsTyping] = useState(false);

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
            setAllQuestions(savedResponse.questions)
            // Dont run if on review page
            if (Number(questionNumber) !== questions?.length) {
                const isThereResponse = savedResponse?.questions[Number(questionNumber)]?.answer
                if (!savedResponse || !isThereResponse) {
                    return
                }
                setJournalText(isThereResponse);
            }
        } catch (error) {
            console.log('error getting saved data in indexedb', error)
        }
    }

    // This runs on every new page
    useEffect(() => {
        if (questionNumber && questions) {
            setCurrentQuestion(questions?.[Number(questionNumber)]?.question)
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
            setAllQuestions(updatedQuestions as ResponseData[]);
            await saveFormData(updatedQuestions, promptSessionId);
            toast('Answers Saved')
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
            router.push(`/jot-response/${promptSessionId}?q=${nextQuestion}`)
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
            {Number(questionNumber) === questions.length ? (
                <div className="mt-16">
                    <MultiQuestionReview
                        allQuestions={allQuestions as ResponseData[]}
                        setAllQuestions={setAllQuestions}
                        isSubmittable={true}
                        showGrades={false}
                    />
                    <div className="flex flex-col justify-center items-center">
                        <p className="text-center font-bold">Ready to Submit?</p>
                        {/* Final form to submit responses to database */}
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
                                id="promptType"
                                name="promptType"
                                value='multi-question'
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
                                <Button onClick={handleSaveResponses} variant='secondary' type="button">Save</Button>
                                <SubmitFormBtn />
                            </div>
                        </form>
                    </div>

                </div>
            ) : (
                // IF not final question, just show the editor and question with continue buttons
                <>
                    <p className="absolute -top-16 right-0 text-sm">Question: {Number(questionNumber) + 1} / {questions.length}</p>
                    <p className="h3-bold mt-16 mb-5 w-full mx-auto text-center">{currentQuestion}</p>
                    <Editor
                        setJournalText={setJournalText}
                        journalText={journalText}
                        inputRef={inputRef}
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

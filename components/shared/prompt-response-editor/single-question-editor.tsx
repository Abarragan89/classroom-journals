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
import { updateStudentResponse, submitStudentResponse } from "@/lib/actions/response.action";
import { toast } from "sonner";
import Editor from "./editor";
import Image from "next/image";
import { imageUrls } from "@/data";

export default function SinglePromptEditor({
    studentResponse,
    responseId,
}: {
    studentResponse: ResponseData[],
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
    const [confirmSubmission, setConfirmSubmission] = useState<boolean>(false);
    // const [isTyping, setIsTyping] = useState(false);
    // const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);


    const [state, action] = useActionState(submitStudentResponse, {
        success: false,
        message: ''
    })

    useEffect(() => {
        if (state?.success) {
            async function finishResponseHandler() {
                router.push('/')
                toast('Blog Posted!')
            }
            finishResponseHandler()
        }
    }, [state.success])


    // This runs on every new page
    useEffect(() => {
        if (questionNumber && studentResponseData) {
            const current = studentResponseData[Number(questionNumber)];
            if (!current) return;

            if (questionNumber === '2') {
                setJournalText(current?.answer || 'https://unfinished-pages.s3.us-east-2.amazonaws.com/fillerImg.png');
                setCurrentQuestion(current.question);
                return;
            }

            setJournalText(current.answer || '');
            setCurrentQuestion(current.question);
            inputRef.current?.focus();
        }
    }, [questionNumber, studentResponseData]);


    // /** Auto-save logic */
    // useEffect(() => {
    //     if (!isTyping) return
    //     if (isTyping) {
    //         if (typingTimeoutRef.current) {
    //             clearTimeout(typingTimeoutRef.current);
    //         }
    //         typingTimeoutRef.current = setTimeout(() => {
    //             handleSaveResponses();
    //             setIsTyping(false);
    //         }, 8000); // Save after 5 seconds of inactivity
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
            setJournalText('')
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

    return (
        <div className="w-full max-w-[900px] mx-auto relative px-5">
            <p className="absolute -top-10 right-0 text-sm">Blog Post</p>
            <ArrowBigLeft className="absolute -top-10 left-0 text-sm hover:cursor-pointer hover:text-accent" onClick={() => router.back()} />
            <p className="mt-16 mb-5 w-full mx-auto whitespace-pre-line text-left text-primary lg:text-lg font-bold">{currentQuestion}</p>
            {/*  Show question if answer question */}
            {questionNumber === '0' && (
                <>
                    <Editor
                        setJournalText={setJournalText}
                        journalText={journalText}
                        // setIsTyping={setIsTyping}
                        jotType='BLOG'
                    />
                    <div className="flex flex-col justify-center items-center mb-20">
                        <form onSubmit={(e) => saveAndContinue(e)}>
                            <SaveAndContinueBtns
                                isSaving={isSaving}
                                submitHandler={() => { handleSaveResponses(); toast('Answers Saved!') }}
                            />
                        </form>
                    </div>
                </>
            )}

            {/* show Blog title input */}
            {questionNumber === '1' && (
                <>
                    <Editor
                        setJournalText={setJournalText}
                        journalText={journalText}
                        // setIsTyping={setIsTyping}
                        characterLimit={70}
                    />
                    <div className="flex flex-col justify-center items-center mb-20">
                        <form onSubmit={(e) => saveAndContinue(e)}>
                            <SaveAndContinueBtns
                                isSaving={isSaving}
                                submitHandler={() => { handleSaveResponses(); toast('Answers Saved!') }}
                            />
                        </form>
                    </div>
                </>
            )}
            {/* Show final image and submission */}
            {questionNumber === '2' && (
                <>
                    {/* Save and Submit Buttons */}
                    <div className="flex flex-col justify-center items-center">
                        <Image
                            src={journalText || 'https://unfinished-pages.s3.us-east-2.amazonaws.com/fillerImg.png'}
                            alt="blog cover photo"
                            width={500}
                            height={300}
                            priority
                            className="rounded-md max-h-[300px]"
                        />
                        <h3 className="h3-bold text-center mt-5">Photo Library</h3>
                        <div className="max-h-[300px] w-[500px] mx-auto mb-10 overflow-y-scroll bg-card flex-center flex-wrap gap-10 mt-3 rounded-md py-10 custom-scrollbar">
                            {imageUrls.map((img) => (
                                <Image
                                    key={img}
                                    src={img}
                                    alt="blog cover photo"
                                    width={200}
                                    height={100}
                                    onClick={() => setJournalText(img)}
                                    className="hover:cursor-pointer"
                                />
                            ))}
                        </div>
                        {confirmSubmission ? (
                            <div className="flex flex-col justify-center items-center">
                                <p className="text-center text-success mb-3 font-bold">Are you sure you want to submit all your answers?</p>
                                <form action={action} className="mt-5">
                                    <input
                                        id="responseId"
                                        name="responseId"
                                        value={responseId}
                                        hidden
                                        readOnly
                                    />
                                    <input
                                        id="blogImage"
                                        name="blogImage"
                                        value={journalText}
                                        hidden
                                        readOnly
                                    />
                                    <input
                                        id="promptType"
                                        name="promptType"
                                        value='BLOG'
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
                                    <div className="flex-center gap-x-7 mb-20">
                                        <Button onClick={() => setConfirmSubmission(false)} variant='secondary' type="button">Cancel</Button>
                                        <SubmitFormBtn />
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <>
                                <p className="text-center mb-3 font-bold">Ready to submit?</p>
                                <div className="flex-center gap-5 mb-20">
                                    <Button variant='secondary' onClick={() => { handleSaveResponses(); toast('Answers Saved!') }} className="flex justify-center mx-auto">Save</Button>
                                    <Button onClick={async () => { await handleSaveResponses(); setConfirmSubmission(true) }}>Submit Responses</Button>
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

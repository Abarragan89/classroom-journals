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
import { BlogImage } from "@/types";
import Image from "next/image";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Input } from "@/components/ui/input";
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import LoadingAnimation from "@/components/loading-animation";

export default function SinglePromptEditor({
    studentResponse,
    responseId,
    spellCheckEnabled,
    studentId
}: {
    studentResponse: ResponseData[],
    responseId: string,
    spellCheckEnabled: boolean,
    studentId: string
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
    const [isLoadingPhotos, setIsLoadingPhotos] = useState<boolean>(false)
    const [allBlogPhotos, setAllBlogPhotos] = useState<BlogImage[] | null>(null)
    const [openPhotoModal, setOpenPhotoModal] = useState<boolean>(false)
    const [filteredBlogPhotos, setFilteredBlogPhotos] = useState<BlogImage[] | null>(null)
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [showConfetti, setShowConfetti] = useState<boolean>(false)
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

    async function fetchPhotos() {
        if (allBlogPhotos !== null) return
        try {
            setIsLoadingPhotos(true)
            const response = await fetch('/api/images/photos');
            if (!response.ok) {
                throw new Error('Failed to fetch photos');
            }
            const data = await response.json();
            setAllBlogPhotos(data.photos);
            setFilteredBlogPhotos(data.photos);
        } catch (error) {
            console.log('error getting blog photos ', error)
        } finally {
            setIsLoadingPhotos(false)
        }
    }

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


    /** Auto-save logic */
    useEffect(() => {
        if (!isTyping) return
        if (isTyping) {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                handleSaveResponses();
                setIsTyping(false);
            }, 15000); // Save after 15 seconds of inactivity
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
            const updatedAnswer = journalText.trimEnd();
            const updatedData = studentResponseData.map((q, index) =>
                index === Number(questionNumber)
                    ? { ...q, answer: updatedAnswer }
                    : q
            );
            setStudentResponseData(updatedData)
            await updateStudentResponse(updatedData, responseId, studentId);
        } catch (error) {
            console.log('error saving to indexed db', error);
        } finally {
            setIsSaving(false);
        }
    }

    async function saveAndContinue(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // Clear timeout so it doesn't go to next page
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

    function filterByTags(userText: string) {
        // Sets user text to lower case and hypenates between multi words
        setFilteredBlogPhotos(allBlogPhotos?.filter(img =>
            img.tags.some(tag => tag.toLowerCase().includes(userText.toLowerCase().replace(/\s+/g, '-')))
        ) ?? []
        );
    }

    function filterByCategory(category: string) {
        setFilteredBlogPhotos(allBlogPhotos?.filter(img => img.category === category) ?? [])
    }

    if (showConfetti && width && height) {
        return (
            <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <Confetti
                    width={width}
                    height={height}
                    numberOfPieces={2000}
                    recycle={false}
                    gravity={0.3}
                    tweenDuration={2000}
                    initialVelocityY={20}
                    initialVelocityX={5}
                    wind={0.01}
                    friction={0.99}
                />
                <div className="animate-fall w-[370px] mt-4 bg-card text-card-foreground rounded-xl p-6 shadow-lg text-center z-40">
                    <p className="text-primary font-bold text-xl text-center">Blog Posted!</p>
                    <Button asChild className="mt-4">
                        <Link href={'/'}>
                            Finish
                        </Link>
                    </Button>
                </div>
            </div>

        )
    }

    const photoCategories = [
        { label: "Academics", value: "academics" },
        { label: "Social Studies", value: "history" },
        { label: "Family", value: "family" },
        { label: "Nature", value: "nature" },
        { label: "Science", value: "science" },
        { label: "Art", value: "art" },
        { label: "Emotions", value: "emotions" },
        { label: "Career", value: "career" },
        { label: "Health", value: "health" },
        { label: "Holidays/Seasons", value: "seasons" },
        { label: "Sports", value: "sports" },
        { label: "Designs", value: "designs" },
    ]

    return (
        <>
            <ResponsiveDialog
                isOpen={openPhotoModal}
                setIsOpen={setOpenPhotoModal}
                title="Photo Library"
            >
                <>
                    {isLoadingPhotos ? (
                        <div className="flex-center h-[355px]">
                            <LoadingAnimation />
                        </div>
                    ) : (
                        <>
                            <Input
                                type="text"
                                placeholder="Search images..."
                                onChange={(e) => filterByTags(e.target.value)}
                                className="mt-3"

                            />
                            <Select name="category" onValueChange={(e) => filterByCategory(e)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent className="w-full">
                                    <SelectGroup>
                                        <SelectLabel>Category</SelectLabel>
                                        {photoCategories.map((category) => (
                                            <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <div className="h-[355px] mx-auto overflow-y-auto flex-center flex-wrap gap-3 custom-scrollbar py-5">
                                {filteredBlogPhotos && filteredBlogPhotos.map((img) => (
                                    <Image
                                        key={img.id}
                                        src={img.url}
                                        alt="blog cover photo"
                                        width={195}
                                        height={110}
                                        onClick={() => { setJournalText(img.url); setOpenPhotoModal(false) }}
                                        className="hover:cursor-pointer rounded-sm hover:scale-105 max-w-[195px]"
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </>
            </ResponsiveDialog>
            <div className="w-full max-w-[900px] mx-auto relative px-5">
                <p className="absolute -top-10 right-0 text-sm">Blog Post</p>
                <ArrowBigLeft className="absolute -top-10 left-0 text-sm hover:cursor-pointer hover:text-accent" onClick={() => {
                    router.back();
                    if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current);
                    }
                }} />
                <p className="mt-16 mb-5 w-full mx-auto whitespace-pre-line text-left text-primary lg:text-lg font-bold">{currentQuestion}</p>
                {/*  Show question if answer question */}
                {questionNumber === '0' && (
                    <>
                        <Editor
                            setJournalText={setJournalText}
                            journalText={journalText}
                            spellCheckEnabled={spellCheckEnabled}
                            setIsTyping={setIsTyping}
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
                            spellCheckEnabled={spellCheckEnabled}
                            setIsTyping={setIsTyping}
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
                                width={448}
                                height={252}
                                priority
                                className="rounded-md max-w-md"
                            />

                            <Button className=" mt-4 mb-8" onClick={() => { setOpenPhotoModal(true); fetchPhotos() }}>Change Photo</Button>

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
                                        <input
                                            id="studentId"
                                            name="studentId"
                                            value={studentId}
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
                                        {/* <Button variant='secondary' onClick={() => { handleSaveResponses(); toast('Answers Saved!') }} className="flex justify-center mx-auto">Save</Button> */}
                                        <Button className="bg-success" onClick={async () => { await handleSaveResponses(); setConfirmSubmission(true) }}>Submit Responses</Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

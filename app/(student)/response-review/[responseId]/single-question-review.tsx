'use client'
import { RubricGradeDisplay, ResponseData, BlogImage } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import Editor from '@/components/shared/prompt-response-editor/editor'
import { useState } from 'react'
import { updateASingleResponse } from '@/lib/actions/response.action';
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import LoadingAnimation from '@/components/loading-animation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ResponsiveDialog } from '@/components/responsive-dialog'
import RubricDisplay from '@/components/rubric-display'

interface SingleQuestionReviewProps {
    questions: ResponseData[],
    isSubmittableInitial: boolean,
    responseId: string,
    showGradesInitial: boolean,
    isPublicInitial: boolean,
    promptSessionId: string,
    spellCheckEnabledInitial: boolean,
    studentId: string,
    rubricGradesInitial?: RubricGradeDisplay[],
    studentName?: string
}

export default function SingleQuestionReview({
    questions,
    isSubmittableInitial,
    responseId,
    showGradesInitial,
    isPublicInitial,
    promptSessionId,
    spellCheckEnabledInitial,
    studentId,
    rubricGradesInitial,
    studentName
}: SingleQuestionReviewProps) {

    const router = useRouter();

    // State for user-editable form fields
    const [allQuestions, setAllQuestions] = useState<ResponseData[]>(questions || []);

    // State for loading and photos
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isLoadingPhotos, setIsLoadingPhotos] = useState<boolean>(false)
    const [allBlogPhotos, setAllBlogPhotos] = useState<BlogImage[] | null>(null)
    const [openPhotoModal, setOpenPhotoModal] = useState<boolean>(false)
    const [filteredBlogPhotos, setFilteredBlogPhotos] = useState<BlogImage[] | null>(null)


    async function updateResponsesHandler(responseData: ResponseData[]) {
        if (isLoading) return
        try {
            setIsLoading(true)
            const submittedAt = new Date()
            const updatedResponse = await updateASingleResponse(studentId, responseId, responseData, submittedAt)
            if (updatedResponse?.success) {
                router.push('/student-dashboard')
                toast('Assignment Submitted!')
            }
        } catch (error) {
            console.log('error updating responses', error)
        } finally {
            setIsLoading(false)
        }
    }

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

    // Handle text change for a specific question
    const handleTextChange = (index: number, newAnswer: string) => {
        setAllQuestions(prevQuestions =>
            prevQuestions.map((q, i) =>
                i === index ? { ...q, answer: newAnswer } : q
            )
        );
    };

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
    const gradePercentage = questions?.[0].score !== undefined ? `${questions?.[0]?.score}%` : 'N/A';


    return (
        <div className=" max-w-[700px] mx-auto w-full relative">
            <div className="flex-between mt-10">
                {showGradesInitial && (
                    <div className="flex items-start">
                        <p className='font-bold text-lg text-muted-foreground ml-0 text-right'>Grade: <span
                            className={`
                            ${parseInt(gradePercentage) >= 90 ? 'text-success' : parseInt(gradePercentage) >= 70 ? 'text-warning' : 'text-destructive'}
                            `}
                        >{gradePercentage}</span></p>
                        {rubricGradesInitial && rubricGradesInitial.length > 0 && (
                            <RubricDisplay
                                rubricGrade={rubricGradesInitial[0]}
                                studentName={studentName}
                                isPrintView={false}
                            />
                        )}
                    </div>
                )}
            </div>
            {isPublicInitial && (
                <div className=" w-full block">
                    <Button asChild
                        className='my-5 w-full'
                    >
                        <Link
                            href={`/discussion-board/${promptSessionId}/response/${responseId}`}
                        >
                            View Discussion
                        </Link>
                    </Button>
                </div>
            )}
            {allQuestions?.slice(0, 2)?.map((responseData, index) => (
                <Card className="w-full p-4 space-y-2 max-w-[700px] mx-auto mb-10 border border-border" key={index}>
                    <CardTitle className="p-2 leading-snug font-bold whitespace-pre-line">
                        {responseData.question}
                    </CardTitle>
                    <CardContent className="p-3 pt-0">
                        {/* <p className="ml-1 mb-1 text-sm font-bold">Response:</p> */}
                        {isSubmittableInitial ? (
                            <>
                                <Editor
                                    setJournalText={(newText) => handleTextChange(index, newText as string)}
                                    journalText={responseData.answer}
                                    characterLimit={index === 1 ? 70 : undefined}
                                    spellCheckEnabled={spellCheckEnabledInitial}
                                />
                            </>
                        ) : (
                            <div className='bg-background px-4 py-3 m-0 rounded-md whitespace-pre-line'>
                                <p>{responseData.answer}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
            {isSubmittableInitial &&
                <div className="flex-center">
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
                                                onClick={() => {
                                                    setAllQuestions(prev => {
                                                        const updated = [...prev];
                                                        updated[2] = { ...updated[2], answer: img.url };
                                                        return updated;
                                                    });
                                                    setOpenPhotoModal(false)
                                                }}
                                                className="hover:cursor-pointer rounded-sm hover:scale-105 max-w-[195px]"
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    </ResponsiveDialog>
                    <div className='flex flex-col justify-center items-center'>
                        <Image
                            src={allQuestions[2]?.answer || 'https://unfinished-pages.s3.us-east-2.amazonaws.com/fillerImg.png'}
                            alt="blog cover photo"
                            width={448}
                            height={252}
                            priority
                            className="rounded-md max-w-md"
                        />
                        <Button className=" mt-4 mb-8" onClick={() => { setOpenPhotoModal(true); fetchPhotos() }}>Change Photo</Button>
                        <Button
                            onClick={() => updateResponsesHandler(allQuestions)}
                            className="mr-0 block mt-5 mb-10"
                        >
                            Submit
                        </Button>
                    </div>

                </div>
            }
        </div>
    );
}



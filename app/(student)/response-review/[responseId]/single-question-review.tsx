'use client'
import { RubricGradeDisplay, ResponseData, BlogImage } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Editor from '@/components/shared/prompt-response-editor/editor'
import { useState } from 'react'
import { updateASingleResponse } from '@/lib/actions/response.action';
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import LoadingAnimation from '@/components/loading-animation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ResponsiveDialog } from '@/components/responsive-dialog'
import RubricDisplay from '@/components/rubric-display'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface SingleQuestionReviewProps {
    questions: ResponseData[],
    isSubmittableInitial: boolean,
    responseId: string,
    showGradesInitial: boolean,
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
    const [isAssignmentCollected, setIsAssignmentCollected] = useState<boolean>(false)

    async function updateResponsesHandler(responseData: ResponseData[]) {
        if (isLoading) return
        try {
            setIsLoading(true)
            const submittedAt = new Date()
            const updatedResponse = await updateASingleResponse(studentId, responseId, responseData, submittedAt)

            // Handle collected assignment
            if (updatedResponse?.isCollected) {
                // Show modal and redirect
                setIsAssignmentCollected(true);
                return;
            }


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
        <>
            <Dialog open={isAssignmentCollected}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assignment Collected</DialogTitle>
                    </DialogHeader>
                    <p className="my-3">Your teacher has collected this assignment. You can no longer edit your answers.</p>
                    <Button onClick={() => router.push('/student-dashboard')}>
                        Go to Dashboard
                    </Button>
                </DialogContent>
            </Dialog>
            <div className="mx-auto w-full relative max-w-[800px] mt-14">

                {showGradesInitial && (
                    <div className='mb-5'>
                        <Badge className='text-md'>Grade: {gradePercentage}</Badge>
                        {rubricGradesInitial && rubricGradesInitial.length > 0 && (
                            <RubricDisplay
                                rubricGrade={rubricGradesInitial[0]}
                                studentName={studentName}
                                isPrintView={false}
                            />
                        )}
                    </div>
                )}

                <div className="space-y-10">
                    {allQuestions?.slice(0, 2)?.map((responseData, index) => (
                        <Editor
                            key={index}
                            questionText={responseData.question}
                            questionNumber={index + 1}
                            totalQuestions={allQuestions.length}
                            setJournalText={(newText) => handleTextChange(index, newText as string)}
                            journalText={responseData.answer}
                            characterLimit={index === 1 ? 70 : undefined}
                            spellCheckEnabled={spellCheckEnabledInitial}
                            isDisabled={!isSubmittableInitial}
                        />
                    ))}
                </div>

                <div>
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

                    <Card className='relative border shadow-lg mt-10'>
                        <CardHeader>
                            <p className='lg:text-lg font-medium leading-relaxed tracking-wider pt-7 pl-6'>Add a Cover Photo</p>
                            <p className='absolute top-3 right-9 text-sm text-muted-foreground'>Question 3 of 3</p>
                        </CardHeader>
                        <CardContent>
                            <Image
                                src={allQuestions[2]?.answer || 'https://unfinished-pages.s3.us-east-2.amazonaws.com/fillerImg.png'}
                                alt="blog cover photo"
                                width={448}
                                height={252}
                                priority
                                className="rounded-md max-w-md mx-auto mb-5 border"
                            />

                            {isSubmittableInitial && (
                                <div className="flex-center">
                                    <Button className="my-3" onClick={() => { setOpenPhotoModal(true); fetchPhotos() }}>Change Photo</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {isSubmittableInitial && (
                        <Button
                            onClick={() => updateResponsesHandler(allQuestions)}
                            className="mr-0 block my-16 mx-auto bg-success"
                        >
                            Submit Blog
                        </Button>
                    )}

                </div>
            </div>
        </>
    );
}



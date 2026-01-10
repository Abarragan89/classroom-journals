'use client'
import { gradeStudentResponse } from "@/lib/actions/response.action";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { saveRubricGrade, deleteRubricGrade } from "@/lib/actions/rubric.actions";
import { Rubric, RubricGrade, RubricListItem, Response, ResponseData, PromptSession } from "@/types";
import { FadeLoader } from 'react-spinners';
import { useTheme } from "next-themes";
import RubricInstance from "@/app/(classroom)/classroom/[classId]/[teacherId]/single-prompt-session/[sessionId]/single-response/[responseId]/rubric-instance";
import { useQueryClient } from '@tanstack/react-query'
import { JsonValue } from '@prisma/client/runtime/library';

export default function ScoreJournalForm({
    currentScore,
    responseId,
    teacherId,
    studentWriting = '',
    sessionId,
}: {
    currentScore: number | string,
    responseId: string,
    teacherId: string,
    studentWriting?: string,
    sessionId?: string,
}) {

    const queryClient = useQueryClient()

    const [showRubicDialog, setShowRubricDialog] = useState(false);
    const [currentRubric, setCurrentRubric] = useState<Rubric | null>(null);
    const [rubricList, setRubricList] = useState<RubricListItem[]>([]);
    const [currentGrade, setCurrentGrade] = useState<RubricGrade | null>(null);
    const [existingGrade, setExistingGrade] = useState<RubricGrade | null>(null);
    const [loadingRubric, setLoadingRubric] = useState(false);
    const [loadingRubricList, setLoadingRubricList] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        if (showRubicDialog && rubricList.length === 0) {
            getRubricList()
        }
    }, [showRubicDialog, rubricList.length]) // eslint-disable-line react-hooks/exhaustive-deps

    // Load existing rubric grades when component mounts
    useEffect(() => {
        loadExistingGrade();
    }, [responseId]); // eslint-disable-line react-hooks/exhaustive-deps

    async function loadExistingGrade() {
        try {
            const response = await fetch(`/api/rubrics/response/${responseId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch rubric grades');
            }
            const data = await response.json();
            const grades = data.rubricGrades;
            const mostRecentGrade = grades && grades.length > 0 ? grades[0] : null;

            if (mostRecentGrade) {
                // Set the existing grade
                const savedGrade: RubricGrade = {
                    rubricId: mostRecentGrade.rubricId,
                    responseId: mostRecentGrade.responseId,
                    categories: mostRecentGrade.categories as RubricGrade['categories'],
                    totalScore: mostRecentGrade.totalScore,
                    maxTotalScore: mostRecentGrade.maxTotalScore,
                    comment: mostRecentGrade.comment || undefined
                };
                setExistingGrade(savedGrade);

                // Convert the saved grade back to a Rubric format for display
                const rubricForDisplay: Rubric = {
                    id: mostRecentGrade.rubric.id,
                    title: mostRecentGrade.rubric.title,
                    categories: mostRecentGrade.rubric.categories as Rubric['categories'],
                    teacherId: mostRecentGrade.teacherId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                setCurrentRubric(rubricForDisplay);
                setCurrentGrade(savedGrade);
            } else {
                setExistingGrade(null);
            }
        } catch (error) {
            console.error('Error loading existing grade:', error);
            // Don't show error toast for this, as it's not critical
        }
    }

    async function updateResponseScore(score: number) {
        try {
            // First, save the new 100-point score
            await gradeStudentResponse(responseId, 0, score, teacherId);

            // Update the response query cache with new score
            queryClient.setQueryData<Response>(['response', responseId], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    rubricGrades: [], // Clear rubric grades when using 100-point scoring
                    response: (old.response as unknown as ResponseData[]).map((item, index) => 
                        index === 0 ? { ...item, score } : item
                    ) as unknown as JsonValue
                } as unknown as Response;
            });

            // Update session data cache if sessionId is provided
            if (sessionId) {
                queryClient.setQueryData<PromptSession>(['getSingleSessionData', sessionId], (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        responses: old.responses?.map((r: Response) =>
                            r.id === responseId
                                ? {
                                    ...r,
                                    rubricGrades: [],
                                    response: (r.response as unknown as ResponseData[]).map((item: ResponseData, index: number) =>
                                        index === 0 ? { ...item, score } : item
                                    ) as unknown as JsonValue
                                }
                                : r
                        )
                    };
                });
            }

            // If there is an existing rubric grade, delete it since we're now using 100-point grading
            if (existingGrade) {
                try {
                    await deleteRubricGrade(responseId, existingGrade.rubricId, teacherId);

                    // Refresh the existing grade
                    await loadExistingGrade();

                    // Clear current rubric state since we're now using 100-point grading
                    setCurrentRubric(null);
                    setCurrentGrade(null);

                } catch (rubricError) {
                    console.error('Error deleting existing rubric grade:', rubricError);
                    // Don't fail the main grade update if rubric deletion fails
                    toast('Grade updated, but failed to clean up rubric grade');
                    return;
                }
            }
            toast('Grade Updated!');
        } catch (error) {
            console.log('error updating score ', error);
            toast('Grade failed to update');
        }
    }

    async function getRubricList() {
        setLoadingRubricList(true);
        try {
            const response = await fetch(`/api/rubrics/teacher/${teacherId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch rubric list');
            }
            const data = await response.json();
            setRubricList(data.rubrics || []);
        } catch (error) {
            console.error('Error fetching rubric list:', error);
            toast('Failed to fetch rubrics');
        } finally {
            setLoadingRubricList(false);
        }
    }

    async function handleRubricSelect(rubricListItem: RubricListItem) {
        setLoadingRubric(true);
        try {
            // Fetch the full rubric data when one is selected
            const response = await fetch(`/api/rubrics/${rubricListItem.id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch rubric details');
            }
            const data = await response.json();
            const fullRubric = data.rubric as Rubric;
            setCurrentRubric(fullRubric);
            setCurrentGrade(null); // Reset grade when selecting new rubric
            setShowRubricDialog(false);
        } catch (error) {
            console.error('Error fetching full rubric:', error);
            toast('Failed to load rubric details');
        } finally {
            setLoadingRubric(false);
        }
    }

    function determineLoadingColor() {
        if (!theme) return '#0e318b'; // default color
        switch (theme) {
            case 'light':
                return '#0e318b'
            case 'tech':
                return '#3de70d'
            case 'dark':
                return '#b5cae3'
            case 'cupid':
                return '#d3225d'
            case 'tuxedo':
                return '#ffffff'
            case 'avocado':
                return '#333d2f'
            default:
                return '#0e318b'
        }
    }

    const handleGradeChange = (grade: RubricGrade) => {
        setCurrentGrade(grade);
    }

    const handleSaveGrade = async (grade: RubricGrade) => {
        try {
            // If there's an existing rubric grade, delete it first (to replace it)
            if (existingGrade && existingGrade.rubricId !== grade.rubricId) {
                try {
                    await deleteRubricGrade(responseId, existingGrade.rubricId, teacherId);
                } catch (deleteError) {
                    console.error('Error deleting previous rubric grade:', deleteError);
                    // Continue with saving the new grade even if deletion fails
                }
            }

            // Save the detailed rubric grade data
            const rubricResult = await saveRubricGrade(
                responseId,
                grade.rubricId,
                teacherId,
                grade.categories,
                grade.totalScore,
                grade.maxTotalScore,
                grade.comment
            );

            if (rubricResult.success) {
                // Also update the response score with the percentage
                await gradeStudentResponse(responseId, 0, rubricResult.grade?.percentageScore || 0, teacherId);

                // Refresh existing grade to show the new grade
                await loadExistingGrade();

                // Construct the rubric grade object that matches the Response type
                const rubricGradeForCache = rubricResult.grade && currentRubric ? {
                    id: rubricResult.grade.id,
                    categories: rubricResult.grade.categories,
                    totalScore: rubricResult.grade.totalScore,
                    maxTotalScore: rubricResult.grade.maxTotalScore,
                    percentageScore: rubricResult.grade.percentageScore,
                    comment: rubricResult.grade.comment || undefined,
                    gradedAt: rubricResult.grade.updatedAt || new Date(),
                    rubric: {
                        id: currentRubric.id,
                        title: currentRubric.title,
                        categories: currentRubric.categories
                    }
                } : null;

                // Update the response query cache with new rubric grade
                queryClient.setQueryData<Response>(['response', responseId], (old) => {
                    if (!old || !rubricGradeForCache) return old;
                    return {
                        ...old,
                        rubricGrades: [rubricGradeForCache],
                        response: (old.response as unknown as ResponseData[]).map((item, index) => 
                            index === 0 ? { ...item, score: rubricResult.grade?.percentageScore || 0 } : item
                        ) as unknown as JsonValue
                    } as unknown as Response;
                });

                // Update session data cache if sessionId is provided
                if (sessionId) {
                    queryClient.setQueryData<PromptSession>(['getSingleSessionData', sessionId], (old) => {
                        if (!old || !rubricGradeForCache) return old;
                        return {
                            ...old,
                            responses: old.responses?.map((r: Response) =>
                                r.id === responseId
                                    ? {
                                        ...r,
                                        rubricGrades: [rubricGradeForCache],
                                        response: (r.response as unknown as ResponseData[]).map((item: ResponseData, index: number) =>
                                            index === 0 ? { ...item, score: rubricResult.grade?.percentageScore || 0 } : item
                                        ) as unknown as JsonValue
                                    } as unknown as Response
                                    : r
                            )
                        };
                    });
                }

                toast('Rubric grade saved successfully!');
            } else {
                toast(rubricResult.message || 'Failed to save rubric grade');
            }
        } catch (error) {
            console.error('Error saving rubric grade:', error);
            toast('Failed to save rubric grade');
        }
    }

    return (
        <>
            <ResponsiveDialog
                title="My Rubrics"
                description="Select a rubric to grade this response"
                isOpen={showRubicDialog}
                setIsOpen={setShowRubricDialog}
            >
                <div className="flex flex-col items-center justify-center">
                    {/* Your Rubrics */}
                    <p className="text-center text-sm text-muted-foreground mt-0">
                        Select a rubric to grade this response
                    </p>
                    {/* This needs to be a scrollable list */}
                    <ScrollArea className="w-[95%] mb-5 mx-auto h-64 mt-4 border border-muted rounded-md">
                        {loadingRubricList ? (
                            <div className="flex flex-col justify-center items-center h-full">
                                <FadeLoader
                                    color={determineLoadingColor()}
                                    aria-label="Loading Rubrics"
                                    data-testid="rubric-loader"
                                    className="my-3 mx-auto"
                                />
                                <p className="text-sm text-muted-foreground mt-2">Loading rubrics...</p>
                            </div>
                        ) : rubricList.length === 0 ? (
                            <p className="p-2 text-center text-muted-foreground">
                                No rubrics found. Please create a rubric first.
                            </p>
                        ) : (
                            rubricList.map((rubricItem: RubricListItem) => {
                                const isCurrentlyLoading = loadingRubric;
                                return (
                                    <div
                                        key={rubricItem.id}
                                        onClick={() => !isCurrentlyLoading && handleRubricSelect(rubricItem)}
                                        className={`p-2 flex justify-between items-center ${isCurrentlyLoading
                                            ? 'cursor-not-allowed opacity-50'
                                            : 'hover:bg-accent hover:text-accent-foreground cursor-pointer'
                                            }`}
                                    >
                                        <span>{rubricItem.title}</span>
                                        <div className="flex items-center gap-2">
                                            {isCurrentlyLoading && (
                                                <div className="flex items-center gap-1">
                                                    <FadeLoader
                                                        color={determineLoadingColor()}
                                                        height={10}
                                                        width={2}
                                                        margin={1}
                                                    />
                                                    <span className="text-xs text-muted-foreground">
                                                        Loading...
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </ScrollArea>
                </div>
            </ResponsiveDialog>


            {/* Show the Input to Grade */}
            {currentRubric === null ? (
                <>
                    {existingGrade && (
                        <div className="flex justify-end mt-5">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    ⚠️ Entering a new score below will replace the{' '}
                                    <span
                                        onClick={async () => {
                                            // Load the most recent rubric grade and show it
                                            await loadExistingGrade();
                                        }}
                                        className="text-accent underline hover:text-accent/80 cursor-pointer"
                                    >
                                        current rubric grade
                                    </span>
                                    .
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end items-center mt-5">
                        <Input
                            type="text"
                            name="journalScore"
                            defaultValue={currentScore}
                            className="h-7 w-[4.1rem] text-center text-sm"
                            placeholder="---"
                            maxLength={3}
                            onBlur={(e) => updateResponseScore(parseInt(e.target.value))}
                        />
                        <p className="mx-2 text-lg">/</p>
                        <p className="text-lg">100 </p>
                    </div>


                    <div className="flex justify-end mt-4">
                        <p
                            onClick={() => setShowRubricDialog(true)}
                            className="underline ml-5 hover:cursor-pointer hover:text-accent"
                        >
                            Grade with Rubric
                        </p>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center">
                    <div className="w-full flex justify-end my-5">
                        <p
                            onClick={() => setCurrentRubric(null)}
                            className="underline hover:cursor-pointer hover:text-accent text-right"
                        >
                            Grade out of 100
                        </p>
                    </div>
                    <RubricInstance
                        rubric={currentRubric}
                        responseId={responseId}
                        existingGrade={currentGrade || undefined}
                        onGradeChange={handleGradeChange}
                        onSave={handleSaveGrade}
                        studentWriting={studentWriting}
                    />
                </div>
            )}
        </>
    )
}

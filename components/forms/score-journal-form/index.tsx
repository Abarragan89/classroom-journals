'use client'
import { gradeStudentResponse } from "@/lib/actions/response.action";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { saveRubricGrade, deleteRubricGrade } from "@/lib/actions/rubric.actions";
import { Rubric, RubricGrade, RubricListItem } from "@/types";
import { FadeLoader } from 'react-spinners';
import { useTheme } from "next-themes";
import RubricInstance from "@/app/(classroom)/classroom/[classId]/[teacherId]/single-prompt-session/[sessionId]/single-response/[responseId]/rubric-instance";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from "@/components/ui/button";

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
    const { theme } = useTheme();

    const [showRubricDialog, setShowRubricDialog] = useState(false);
    const [currentRubric, setCurrentRubric] = useState<Rubric | null>(null);

    // Fetch existing rubric grades with React Query
    const { data: rubricGradeData } = useQuery({
        queryKey: ['rubricGrades', responseId],
        queryFn: async () => {
            const response = await fetch(`/api/rubrics/response/${responseId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch rubric grades');
            }
            const data = await response.json();
            return data.rubricGrades;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Fetch rubric list with React Query
    const { data: rubricList = [], isLoading: loadingRubricList } = useQuery({
        queryKey: ['rubricList', teacherId],
        queryFn: async () => {
            const response = await fetch(`/api/rubrics/teacher/${teacherId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch rubric list');
            }
            const data = await response.json();
            return data.rubrics || [];
        },
        enabled: showRubricDialog, // Only fetch when dialog is open
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Derive existing grade from query data
    const mostRecentGrade = rubricGradeData && rubricGradeData.length > 0 ? rubricGradeData[0] : null;
    const existingGrade: RubricGrade | null = mostRecentGrade ? {
        rubricId: mostRecentGrade.rubricId,
        responseId: mostRecentGrade.responseId,
        categories: mostRecentGrade.categories as RubricGrade['categories'],
        totalScore: mostRecentGrade.totalScore,
        maxTotalScore: mostRecentGrade.maxTotalScore,
        comment: mostRecentGrade.comment || undefined
    } : null;

    // Auto-set currentRubric when existing grade loads (only once)
    useEffect(() => {
        if (mostRecentGrade && !currentRubric) {
            const rubricForDisplay: Rubric = {
                id: mostRecentGrade.rubric.id,
                title: mostRecentGrade.rubric.title,
                categories: mostRecentGrade.rubric.categories as Rubric['categories'],
                teacherId: mostRecentGrade.teacherId,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            setCurrentRubric(rubricForDisplay);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mostRecentGrade]); // Only run when mostRecentGrade changes, not currentRubric

    // Mutation for updating 100-point score
    const updateScoreMutation = useMutation({
        mutationFn: async (score: number) => {
            // Delete existing rubric grade if present
            if (existingGrade) {
                await deleteRubricGrade(responseId, existingGrade.rubricId, teacherId);
            }
            // Save the new 100-point score
            await gradeStudentResponse(responseId, 0, score, teacherId);
            return score;
        },
        onSuccess: () => {
            // Invalidate all related queries to refetch fresh data
            queryClient.invalidateQueries({ queryKey: ['rubricGrades', responseId] });
            queryClient.invalidateQueries({ queryKey: ['response', responseId] });
            if (sessionId) {
                queryClient.invalidateQueries({ queryKey: ['getSingleSessionData', sessionId] });
            }
            setCurrentRubric(null);
            toast('Grade Updated!');
        },
        onError: (error) => {
            console.error('error updating score:', error);
            toast('Grade failed to update');
        }
    });

    // Mutation for selecting a rubric (fetch full details)
    const selectRubricMutation = useMutation({
        mutationFn: async (rubricListItem: RubricListItem) => {
            const response = await fetch(`/api/rubrics/${rubricListItem.id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch rubric details');
            }
            const data = await response.json();
            return data.rubric as Rubric;
        },
        onSuccess: (fullRubric) => {
            setCurrentRubric(fullRubric);
            setShowRubricDialog(false);
        },
        onError: (error) => {
            console.error('Error fetching full rubric:', error);
            toast('Failed to load rubric details');
        }
    });

    const handleRubricSelect = (rubricListItem: RubricListItem) => {
        selectRubricMutation.mutate(rubricListItem);
    };

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

    // Mutation for saving rubric grade with optimistic updates
    const saveGradeMutation = useMutation({
        mutationFn: async (grade: RubricGrade) => {
            // Save the detailed rubric grade data (upsert handles update/create)
            const rubricResult = await saveRubricGrade(
                responseId,
                grade.rubricId,
                teacherId,
                grade.categories,
                grade.totalScore,
                grade.maxTotalScore,
                grade.comment
            );

            if (!rubricResult.success) {
                throw new Error(rubricResult.message || 'Failed to save rubric grade');
            }

            // Also update the response score with the percentage
            await gradeStudentResponse(responseId, 0, rubricResult.grade?.percentageScore || 0, teacherId);

            return rubricResult;
        },
        onMutate: async (grade: RubricGrade) => {
            // Cancel any outgoing refetches to avoid overwriting our optimistic update
            await queryClient.cancelQueries({ queryKey: ['rubricGrades', responseId] });

            // Snapshot the previous value
            const previousGrade = queryClient.getQueryData(['rubricGrades', responseId]);

            // Optimistically update the cache with the new grade
            queryClient.setQueryData(['rubricGrades', responseId], grade);

            // Return context with the previous value for potential rollback
            return { previousGrade };
        },
        onSuccess: () => {
            // Invalidate all related queries to refetch fresh data from server
            queryClient.invalidateQueries({ queryKey: ['rubricGrades', responseId] });
            queryClient.invalidateQueries({ queryKey: ['response', responseId] });
            if (sessionId) {
                queryClient.invalidateQueries({ queryKey: ['getSingleSessionData', sessionId] });
            }
            toast('Rubric grade saved successfully!');
        },
        onError: (error: Error, _grade, context) => {
            // Rollback to the previous value on error
            if (context?.previousGrade) {
                queryClient.setQueryData(['rubricGrades', responseId], context.previousGrade);
            }
            console.error('Error saving rubric grade:', error);
            toast(error.message || 'Failed to save rubric grade');
        }
    });

    const handleSaveGrade = (grade: RubricGrade) => {
        saveGradeMutation.mutate(grade);
    };

    return (
        <>
            <ResponsiveDialog
                title="My Rubrics"
                description="Select a rubric to grade this response"
                isOpen={showRubricDialog}
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
                                const isCurrentlyLoading = selectRubricMutation.isPending;
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
                    <div className="flex flex-col items-end space-y-4">
                        {existingGrade && (
                            <div className="flex justify-end">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        ⚠️ Entering a new score below will replace the{' '}
                                        <span
                                            onClick={() => {
                                                // Show the rubric grade view
                                                if (mostRecentGrade) {
                                                    const rubricForDisplay: Rubric = {
                                                        id: mostRecentGrade.rubric.id,
                                                        title: mostRecentGrade.rubric.title,
                                                        categories: mostRecentGrade.rubric.categories as Rubric['categories'],
                                                        teacherId: mostRecentGrade.teacherId,
                                                        createdAt: new Date(),
                                                        updatedAt: new Date()
                                                    };
                                                    setCurrentRubric(rubricForDisplay);
                                                }
                                            }}
                                            className="text-muted-foreground underline hover:text-primary cursor-pointer"
                                        >
                                            current rubric grade
                                        </span>
                                        .
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center mt-5">
                            <Input
                                type="text"
                                name="journalScore"
                                defaultValue={currentScore}
                                className="h-7 w-[4.1rem] text-center text-sm"
                                placeholder="---"
                                maxLength={3}
                                onBlur={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value)) {
                                        updateScoreMutation.mutate(value);
                                    }
                                }}
                            />
                            <p className="mx-2 text-lg">/</p>
                            <p className="text-lg">100 </p>
                        </div>
                        <Button
                            variant={'outline'}
                            onClick={() => setShowRubricDialog(true)}
                        >
                            Grade with Rubric
                        </Button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center">
                    <div className="w-full flex justify-end mt-10">
                        <Button
                            onClick={() => setCurrentRubric(null)}
                            variant={"outline"}
                        >
                            Grade out of 100
                        </Button>
                    </div>
                    <RubricInstance
                        rubric={currentRubric}
                        responseId={responseId}
                        existingGrade={existingGrade || undefined}
                        onSave={handleSaveGrade}
                        studentWriting={studentWriting}
                        isSaving={saveGradeMutation.isPending}
                    />
                </div>
            )}
        </>
    )
}

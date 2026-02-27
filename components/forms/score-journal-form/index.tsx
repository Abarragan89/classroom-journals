'use client'
import { gradeStudentResponse } from "@/lib/actions/response.action";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { saveRubricGrade, deleteRubricGrade } from "@/lib/actions/rubric.actions";
import { Rubric, RubricGrade, RubricListItem, PromptSession, Response, ResponseData } from "@/types";
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
    response
}: {
    currentScore: number | string,
    responseId: string,
    teacherId: string,
    studentWriting?: string,
    response?: Response
}) {

    const queryClient = useQueryClient()
    const { theme } = useTheme();

    const [showRubricDialog, setShowRubricDialog] = useState(false);
    const [currentRubric, setCurrentRubric] = useState<Rubric | null>(null);
    const [isAIGrading, setIsAIGrading] = useState(response?.isAIGrading || false);

    const { data: responseData } = useQuery({
        queryKey: ['response', responseId],
        queryFn: async () => {
            const res = await fetch(`/api/responses/${responseId}?userId=${teacherId}`);
            const data = await res.json() as { response: Response };
            return data.response;
        },
        refetchInterval: () => {
            // Poll every 5 seconds while AI is grading
            return isAIGrading ? 5000 : false;
        },
        staleTime: 1000 * 60 * 5,
        initialData: response // Use the response passed as prop for initial data to avoid loading state
    });

    // Update local state when response data changes (separate from refetchInterval)
    useEffect(() => {
        if (responseData?.isAIGrading !== undefined) {
            setIsAIGrading(responseData.isAIGrading);
        }
    }, [responseData?.isAIGrading]);

    // Extract rubric grades from the response data (no separate query needed)
    const rubricGradeData = responseData?.rubricGrades || [];

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
    const existingGrade: RubricGrade | undefined = rubricGradeData && rubricGradeData.length > 0 ? {
        rubricId: rubricGradeData[0].rubric.id,
        responseId: responseId,
        categories: rubricGradeData[0].categories as RubricGrade['categories'],
        totalScore: rubricGradeData[0].totalScore,
        maxTotalScore: rubricGradeData[0].maxTotalScore,
        comment: rubricGradeData[0].comment || undefined
    } : undefined;

    // Auto-set currentRubric when existing grade loads (only once)
    useEffect(() => {
        if (rubricGradeData && rubricGradeData.length > 0 && !currentRubric) {
            const rubricData = rubricGradeData[0]?.rubric;
            // Only set rubric if it has all required fields
            if (rubricData?.id && rubricData?.title && rubricData?.categories) {
                const rubricForDisplay: Rubric = {
                    id: rubricData.id,
                    title: rubricData.title,
                    categories: rubricData.categories as Rubric['categories'],
                    teacherId: teacherId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                setCurrentRubric(rubricForDisplay);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rubricGradeData]); // Only run when rubricGradeData changes, not currentRubric

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
        onSuccess: (score) => {
            // Update response cache with new score and clear rubricGrades
            const responseCache = queryClient.getQueryData(['response', responseId]);
            if (responseCache && typeof responseCache === 'object') {
                queryClient.setQueryData(['response', responseId], {
                    ...responseCache,
                    rubricGrades: [], // Clear rubric grades when using 100-point score
                    response: Array.isArray((responseCache as any).response)
                        ? (responseCache as any).response.map((r: any) => ({
                            ...r,
                            score: score
                        }))
                        : (responseCache as any).response
                });
            }

            // Update all session caches containing this response
            queryClient.getQueryCache().findAll()
                .filter(query =>
                    Array.isArray(query.queryKey) &&
                    query.queryKey[0] === 'getSingleSessionData'
                )
                .forEach((query) => {
                    const sessionData = query.state.data as PromptSession | undefined;
                    if (sessionData?.responses?.some((resp: Response) => resp.id === responseId)) {
                        queryClient.setQueryData(query.queryKey, {
                            ...sessionData,
                            responses: sessionData.responses.map((resp: Response) =>
                                resp.id === responseId
                                    ? {
                                        ...resp,
                                        rubricGrades: [], // Clear rubric grades in session cache too
                                        response: Array.isArray(resp.response)
                                            ? ((resp.response as unknown) as ResponseData[]).map(r => ({
                                                ...r,
                                                score: score
                                            }))
                                            : resp.response
                                    }
                                    : resp
                            )
                        });
                    }
                });

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
            await queryClient.cancelQueries({ queryKey: ['response', responseId] });

            // Snapshot the previous value
            const previousResponse = queryClient.getQueryData(['response', responseId]);

            // Optimistically update the response cache with the new rubric grade
            const responseCache = queryClient.getQueryData(['response', responseId]);
            if (responseCache && typeof responseCache === 'object') {
                queryClient.setQueryData(['response', responseId], {
                    ...responseCache,
                    rubricGrades: [{
                        ...grade,
                        rubric: currentRubric
                    }]
                });
            }

            // Return context with the previous value for potential rollback
            return { previousResponse };
        },
        onSuccess: (rubricResult) => {
            const percentageScore = rubricResult.grade?.percentageScore || 0;

            // Update response cache with rubric grade and score
            const responseCache = queryClient.getQueryData(['response', responseId]);
            if (responseCache && typeof responseCache === 'object') {
                queryClient.setQueryData(['response', responseId], {
                    ...responseCache,
                    rubricGrades: [{
                        ...rubricResult.grade,
                        rubric: currentRubric // Preserve full rubric details including categories
                    }],
                    response: Array.isArray((responseCache as any).response)
                        ? (responseCache as any).response.map((r: any) => ({
                            ...r,
                            score: percentageScore
                        }))
                        : (responseCache as any).response
                });
            }

            // Update all session caches containing this response
            queryClient.getQueryCache().findAll()
                .filter(query =>
                    Array.isArray(query.queryKey) &&
                    query.queryKey[0] === 'getSingleSessionData'
                )
                .forEach((query) => {
                    const sessionData = query.state.data as PromptSession | undefined;
                    if (sessionData?.responses?.some((resp: Response) => resp.id === responseId)) {
                        queryClient.setQueryData(query.queryKey, {
                            ...sessionData,
                            responses: sessionData.responses.map((resp: Response) =>
                                resp.id === responseId
                                    ? {
                                        ...resp,
                                        rubricGrades: [{
                                            ...rubricResult.grade,
                                            rubric: currentRubric
                                        }],
                                        response: Array.isArray(resp.response)
                                            ? ((resp.response as unknown) as ResponseData[]).map(r => ({
                                                ...r,
                                                score: percentageScore
                                            }))
                                            : resp.response
                                    }
                                    : resp
                            )
                        });
                    }
                });

            toast('Rubric grade saved successfully!');
        },
        onError: (error: Error, _grade, context) => {
            // Rollback to the previous value on error
            if (context?.previousResponse) {
                queryClient.setQueryData(['response', responseId], context.previousResponse);
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
                                                if (rubricGradeData && rubricGradeData.length > 0) {
                                                    const rubricData = rubricGradeData[0]?.rubric;
                                                    // Only set rubric if it has all required fields
                                                    if (rubricData?.id && rubricData?.title && rubricData?.categories) {
                                                        const rubricForDisplay: Rubric = {
                                                            id: rubricData.id,
                                                            title: rubricData.title,
                                                            categories: rubricData.categories as Rubric['categories'],
                                                            teacherId: teacherId,
                                                            createdAt: new Date(),
                                                            updatedAt: new Date()
                                                        };
                                                        setCurrentRubric(rubricForDisplay);
                                                    }
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
                        setIsAIGrading={setIsAIGrading}
                        isAIGrading={isAIGrading}
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

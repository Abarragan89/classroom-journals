'use client'
import { gradeStudentResponse } from "@/lib/actions/response.action";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { saveRubricGrade, deleteRubricGrade } from "@/lib/actions/rubric.actions";
import { Rubric, RubricGrade, RubricListItem, PromptSession, Response, ResponseData } from "@/types";
import { FadeLoader } from 'react-spinners';
import { useTheme } from "next-themes";
import RubricInstance from "@/app/(classroom)/classroom/[classId]/[teacherId]/single-prompt-session/[sessionId]/single-response/[responseId]/rubric-instance";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function ScoreJournalForm({
    currentScore,
    responseId,
    teacherId,
    studentWriting = '',
    response,
    sessionId
}: {
    currentScore: number | string,
    responseId: string,
    teacherId: string,
    studentWriting?: string,
    response?: Response,
    sessionId: string
}) {

    const queryClient = useQueryClient()
    const { theme } = useTheme();

    const [activeTab, setActiveTab] = useState<'manual' | 'rubric'>(response?.rubricGrades ? 'rubric' : 'manual');
    const [currentRubric, setCurrentRubric] = useState<Rubric | null>(null);
    const [previousRubric, setPreviousRubric] = useState<Rubric | null>(null);
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
    const rubricGradeData = responseData?.rubricGrades || undefined;

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
        enabled: activeTab === 'rubric', // Only fetch when rubric tab is active
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Derive existing grade from query data
    const existingGrade: RubricGrade | undefined = rubricGradeData ? {
        id: rubricGradeData.id,
        rubricId: rubricGradeData.rubricId,
        responseId: responseId,
        categories: rubricGradeData.categories as RubricGrade['categories'],
        totalScore: rubricGradeData.totalScore,
        maxTotalScore: rubricGradeData.maxTotalScore,
        comment: rubricGradeData.comment || undefined
    } : undefined;

    // Auto-set currentRubric when existing grade loads (only once)
    useEffect(() => {
        if (rubricGradeData && !currentRubric) {
            const rubricData = rubricGradeData?.rubric;
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
                await deleteRubricGrade(responseId, teacherId);
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
                    rubricGrades: null, // Clear rubric grades when using 100-point score
                    response: Array.isArray((responseCache as any).response)
                        ? (responseCache as any).response.map((r: any) => ({
                            ...r,
                            score: score
                        }))
                        : (responseCache as any).response
                });
            }

            // Update all session caches containing this response
            queryClient.setQueryData(['getSingleSessionData', sessionId], (sessionData: PromptSession | undefined) => {
                if (!sessionData) return sessionData;
                return {
                    ...sessionData,
                    responses: sessionData?.responses?.map((resp: Response) =>
                        resp.id === responseId
                            ? {
                                ...resp,
                                rubricGrades: null, // Clear rubric grades in session cache too
                                response: Array.isArray(resp.response)
                                    ? ((resp.response as unknown) as ResponseData[]).map(r => ({
                                        ...r,
                                        score: score
                                    }))
                                    : resp.response
                            }
                            : resp
                    )
                };
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
            setPreviousRubric(null);
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
                    rubricGrades: {
                        ...grade,
                        rubric: currentRubric
                    }
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
                    rubricGrades: {
                        ...rubricResult.grade,
                        rubric: currentRubric // Preserve full rubric details including categories
                    },
                    response: Array.isArray((responseCache as any).response)
                        ? (responseCache as any).response.map((r: any) => ({
                            ...r,
                            score: percentageScore
                        }))
                        : (responseCache as any).response
                });
            }

            // Update all session caches containing this response
            queryClient.setQueryData(['getSingleSessionData', sessionId], (sessionData: PromptSession | undefined) => {
                if (!sessionData) return sessionData;
                return {
                    ...sessionData,
                    responses: sessionData?.responses?.map((resp: Response) =>
                        resp.id === responseId
                            ? {
                                ...resp,
                                rubricGrades: {
                                    ...rubricResult.grade,
                                    rubric: currentRubric
                                },
                                response: Array.isArray(resp.response)
                                    ? ((resp.response as unknown) as ResponseData[]).map(r => ({
                                        ...r,
                                        score: percentageScore
                                    }))
                                    : resp.response
                            }
                            : resp
                    )
                };
            });

            toast('Rubric grade saved successfully!');
        },
        onError: (error: Error, _grade, context) => {
            // Rollback to the previous value on error
            if (context?.previousResponse) {
                queryClient.setQueryData(['response', responseId], context.previousResponse);
            }
            console.error('Error saving rubric grade:', error);
            toast('Failed to save rubric grade');
        }
    });

    const handleSaveGrade = (grade: RubricGrade) => {
        saveGradeMutation.mutate(grade);
    };

    return (
        <Card className="shadow-sm border border-muted">
            <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Grading</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'manual' | 'rubric')}>
                    <TabsList className="w-full mb-4">
                        <TabsTrigger value="manual" className="flex-1">Score / 100</TabsTrigger>
                        <TabsTrigger value="rubric" className="flex-1 gap-1.5">
                            Use Rubric
                            {existingGrade && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual">
                        <div className="flex flex-col items-end space-y-1">
                            <p className="text-xs text-muted-foreground">Score</p>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="journal-score"
                                    type="text"
                                    name="journalScore"
                                    defaultValue={currentScore}
                                    className="h-8 w-[4.1rem] text-center font-bold"
                                    placeholder="---"
                                    maxLength={3}
                                    onBlur={(e) => {
                                        const value = parseInt(e.target.value);
                                        if (!isNaN(value) && value !== parseInt(String(currentScore))) {
                                            updateScoreMutation.mutate(value);
                                        }
                                    }}
                                />
                                <span className="text-muted-foreground font-bold text-md">/ 100</span>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="rubric">
                        {currentRubric === null ? (
                            <div className="flex flex-col">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm font-medium">Select a rubric</p>
                                    {previousRubric && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setCurrentRubric(previousRubric);
                                                setPreviousRubric(null);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                                <ScrollArea className="w-full h-64 border border-muted rounded-md">
                                    {loadingRubricList ? (
                                        <div className="flex flex-col justify-center items-center py-8">
                                            <FadeLoader
                                                color={determineLoadingColor()}
                                                aria-label="Loading Rubrics"
                                                data-testid="rubric-loader"
                                                className="my-3 mx-auto"
                                            />
                                            <p className="text-sm text-muted-foreground mt-2">Loading rubrics...</p>
                                        </div>
                                    ) : rubricList.length === 0 ? (
                                        <p className="p-4 text-center text-sm text-muted-foreground">
                                            No rubrics found. Please create a rubric first.
                                        </p>
                                    ) : (
                                        rubricList.map((rubricItem: RubricListItem) => {
                                            const isCurrentlyLoading = selectRubricMutation.isPending;
                                            return (
                                                <button
                                                    type="button"
                                                    key={rubricItem.id}
                                                    onClick={() => !isCurrentlyLoading && handleRubricSelect(rubricItem)}
                                                    disabled={isCurrentlyLoading}
                                                    className={`p-2 w-full text-left flex justify-between items-center ${isCurrentlyLoading
                                                        ? 'cursor-not-allowed opacity-50'
                                                        : 'hover:bg-accent hover:text-accent-foreground cursor-pointer'
                                                        }`}
                                                >
                                                    <span>{rubricItem.title}</span>
                                                    {isCurrentlyLoading && (
                                                        <div className="flex items-center gap-1">
                                                            <FadeLoader
                                                                color={determineLoadingColor()}
                                                                height={10}
                                                                width={2}
                                                                margin={1}
                                                            />
                                                            <span className="text-xs text-muted-foreground">Loading...</span>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })
                                    )}
                                </ScrollArea>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <div className="flex justify-end mb-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setPreviousRubric(currentRubric);
                                            setCurrentRubric(null);
                                        }}
                                    >
                                        Change rubric
                                    </Button>
                                </div>
                                <RubricInstance
                                    rubric={currentRubric}
                                    responseId={responseId}
                                    setIsAIGrading={setIsAIGrading}
                                    sessionId={sessionId}
                                    isAIGrading={isAIGrading}
                                    existingGrade={existingGrade || undefined}
                                    onSave={handleSaveGrade}
                                    studentWriting={studentWriting}
                                    isSaving={saveGradeMutation.isPending}
                                />
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

'use client'
import { gradeStudentResponse } from "@/lib/actions/response.action";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getRubricsByTeacherId } from "@/lib/actions/rubric.actions";
import { Rubric } from "@/types";
import RubricInstance from "@/app/(classroom)/classroom/[classId]/[teacherId]/single-prompt-session/[sessionId]/single-response/[responseId]/rubric-instance";

export default function ScoreJournalForm({
    currentScore,
    responseId,
    teacherId,
}: {
    currentScore: number | string,
    responseId: string,
    teacherId: string
}) {

    const [showRubicDialog, setShowRubricDialog] = useState(false);
    const [currentRubric, setCurrentRubric] = useState<Rubric | null>(null);
    const [rubrics, setRubrics] = useState<Rubric[]>([]);

    useEffect(() => {
        if (showRubicDialog && rubrics.length === 0) {
            getRubrics()
        }
    }, [showRubicDialog])

    async function updateResponseScore(score: number) {
        try {
            await gradeStudentResponse(responseId, 0, score, teacherId)
            toast('Grade Update!')
        } catch (error) {
            console.log('error updating score ', error)
            toast('Grade failed to update')
        }
    }

    async function getRubrics() {
        console.log('fetching rubrics for teacherId:', teacherId)
        try {
            // this should just get the Ids of them and another one when chosen. Maybe not, it's only ten to 20 rubrics, should be fine. won't be even be hundreds. 
            const response = await getRubricsByTeacherId(teacherId) as unknown as Rubric[];
            setRubrics(response || []);
        } catch (error) {
            console.error('Error fetching rubrics:', error);
            toast('Failed to fetch rubrics');
        }
    }

    async function handleRubricSelect(rubric: Rubric) {
        setCurrentRubric(rubric);
        setShowRubricDialog(false);
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
                        {rubrics.length === 0 ? (
                            <p className="p-2 text-center text-muted-foreground">
                                No rubrics found. Please create a rubric first.
                            </p>
                        ) : (
                            rubrics.map((rubric) => (
                                <p
                                    key={rubric.id}
                                    onClick={() => handleRubricSelect(rubric)}
                                    className="p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                >
                                    {rubric.title}
                                </p>
                            ))
                        )}
                    </ScrollArea>
                </div>
            </ResponsiveDialog>


            {/* Show the Input to Grade */}
            {currentRubric === null ? (
                <>
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
                    <p className="text-lg font-bold mb-2">{currentRubric.title}</p>
                    <RubricInstance
                        rubric={currentRubric}
                    />
                </div>
            )}


            {/* Show the Rubric to Grade  */}

            {/* {currentRubric && (
                <div className="flex flex-col items-center justify-center">
                    <p className="text-lg font-bold mb-2">{currentRubric.title}</p>
                    <RubricInstance
                        rubric={currentRubric}
                    />
                </div>
            )} */}

        </>
    )
}

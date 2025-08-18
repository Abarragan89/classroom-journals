"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import CreateEditRubric from "./create-edit-rubric"
import MyRubricList from "./my-rubric-list"
import { Rubric } from "@/types"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export default function MyRubricSection({
    teacherId,
    teacherRubrics
}: {
    teacherId: string
    teacherRubrics?: Rubric[]
}) {

    const [showMyRubrics, setShowMyRubrics] = useState(true)
    const [currentRubric, setCurrentRubric] = useState<Rubric | null>(null)
    const queryClient = useQueryClient()

    const toggleShowMyRubrics = (rubricData: Rubric) => {
        setShowMyRubrics(!showMyRubrics)
        setCurrentRubric(rubricData)
    }

    // Use Tanstack Query to fetch data and use teacherRubrics prop if available
    const { data: allRubrics } = useQuery({
        queryKey: ['rubrics', teacherId],
        queryFn: async () => {
            const response = await fetch(`/api/rubrics/teacher/${teacherId}/full`);
            if (!response.ok) {
                throw new Error('Failed to fetch teacher rubrics');
            }
            const data = await response.json();
            return data.rubrics as Rubric[];
        },
        initialData: teacherRubrics || []
    })

    // Function to handle rubric updates to send user back to list with updated rubric
    function handleRubricUpdate(updateType: string) {
        // Refetch the rubric list after an update
        queryClient.invalidateQueries({ queryKey: ['rubrics', teacherId] })
        setShowMyRubrics(true)
        // show toast to notificy user of success
        const message = `Rubric ${updateType}.`

        if (updateType === 'deleted') {
            toast.error(message, {
                style: { background: 'hsl(0 84.2% 60.2%)', color: 'white' }
            })
        } else {
            toast(message)
        }
    }

    return (
        <>
            <h2 className="text-2xl lg:text-3xl mb-4">
                {showMyRubrics ? "My Rubrics" : "Create/Edit Rubric"}
            </h2>

            <Button onClick={() => { setShowMyRubrics(!showMyRubrics); setCurrentRubric(null) }} className="my-3">
                {showMyRubrics ? "Create New Rubric" : "Back to My Rubrics"}
            </Button>

            {showMyRubrics ? (
                <MyRubricList
                    teacherRubrics={allRubrics || []}
                    toggleShowMyRubrics={toggleShowMyRubrics}
                />
            ) : (
                <CreateEditRubric
                    teacherId={teacherId}
                    currentRubric={currentRubric}
                    onRubricUpdate={handleRubricUpdate}
                />
            )}
        </>
    )
}

"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import CreateEditRubric from "./create-edit-rubric"
import MyRubricList from "./my-rubric-list"
import { Rubric } from "@/types"
import { useQuery } from "@tanstack/react-query"

export default function MyRubricSection({
    teacherId,
    teacherRubrics
}: {
    teacherId: string
    teacherRubrics?: Rubric[]
}) {

    const [showMyRubrics, setShowMyRubrics] = useState(true)
    const [currentRubric, setCurrentRubric] = useState<Rubric | null>(null)

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
        initialData: teacherRubrics || [],
        staleTime: 1000 * 60 * 10, // 10 minutes
    })

    // Function to handle rubric updates to send user back to list with updated rubric
    function handleRubricUpdate() {
        setShowMyRubrics(true);
    }

    return (
        <>
            <h2 className="text-2xl lg:text-3xl mb-4">
                {showMyRubrics ? "My Rubrics" : "Create/Edit Rubric"}
            </h2>

            <Button variant={"outline"} onClick={() => { setShowMyRubrics(!showMyRubrics); setCurrentRubric(null) }} className="my-3">
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

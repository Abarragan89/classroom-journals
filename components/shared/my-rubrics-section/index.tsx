"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import CreateEditRubric from "./create-edit-rubric"
import MyRubricList from "./my-rubric-list"
import { Rubric } from "@/types"

export default function MyRubricSection({
    teacherId,
    teacherRubrics
}: {
    teacherId: string
    teacherRubrics?: Rubric[]
}) {

    const [showMyRubrics, setShowMyRubrics] = useState(true)

    return (
        <>
            <h2 className="text-2xl lg:text-3xl mb-4">Rubric Builder</h2>

            <Button onClick={() => setShowMyRubrics(!showMyRubrics)} className="mb-4">
                {showMyRubrics ? "Create New Rubric" : "Back to My Rubrics"}
            </Button>

            {showMyRubrics ? (
                <MyRubricList 
                    teacherRubrics={teacherRubrics || []}
                />
            ) : (
                <CreateEditRubric
                    teacherId={teacherId}
                />
            )}
        </>
    )
}

'use client'
import { Button } from "@/components/ui/button";
import { toggleHideShowGrades } from "@/lib/actions/response.action";
import { useState } from "react";

export default function ToggleGradesVisible({
  promptSessionId,
  gradesVisibility
}: {
  promptSessionId: string,
  gradesVisibility: boolean
}) {

  const [areGradesVisible, setAreGradesVisible] = useState(gradesVisibility)

  async function toggleGradeVisibiltyHandler(areGradesVisible: boolean) {
    try {
      const response = await toggleHideShowGrades(promptSessionId, areGradesVisible)
      if (response.success) {
        setAreGradesVisible(areGradesVisible)
      }
    } catch (error) {
      console.log('error toggling grade visibility', error)
    }
  }

  return (
    <>
      {areGradesVisible ? (
        <>
          <Button
            onClick={() => toggleGradeVisibiltyHandler(false)}
          >
            Hide Grades
          </Button>
          <p className="text-xs italic text-success">Scores are visible to students</p>
        </>
      ) : (
        <>
          <Button
            onClick={() => toggleGradeVisibiltyHandler(true)}
          >
            Show Grades
          </Button>
          <p className="text-xs italic text-destructive">Scores are not visible to students</p>
        </>
      )}
    </>
  )
}

'use client'
import { toggleHideShowGrades } from "@/lib/actions/response.action";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export default function ToggleGradesVisible({
  promptSessionId,
  gradesVisibility
}: {
  promptSessionId: string,
  gradesVisibility: boolean
}) {

  const [areGradesVisible, setAreGradesVisible] = useState<boolean>(gradesVisibility)

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
    <div className="space-y-2">
      {/* <p>Grade Visibility</p> */}
      {areGradesVisible ? (
        <p className="text-sm text-success">Scores are visible to students</p>
      ) : (
        <p className="text-sm text-destructive">Scores are not visible to students</p>
      )}
      
      <span className="text-sm mt-2">Hide</span>
      <Switch
        className="text-sm mx-2"
        onCheckedChange={(e) => toggleGradeVisibiltyHandler(e)}
        checked={areGradesVisible}
      />
      <span className="text-sm">Show</span>
    </div>
  )
}

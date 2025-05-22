'use client'
import { gradeStudentResponse } from "@/lib/actions/response.action";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ScoreJournalForm({
    currentScore,
    responseId,
    teacherId,
}: {
    currentScore: number | string,
    responseId: string,
    teacherId: string
}) {


    async function updateResponseScore(score: number) {
        try {
            await gradeStudentResponse(responseId, 0, score, teacherId)
            toast('Grade Update!')
        } catch (error) {
            console.log('error updating score ', error)
            toast('Grade failed to update')
        }
    }

    return (
        <div className="flex-end">
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
    )
}

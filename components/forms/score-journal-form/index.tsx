'use client'
import { gradeStudentResponse } from "@/lib/actions/response.action";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ScoreJournalForm({
    currentScore,
    responseId
}: {
    currentScore: number | string,
    responseId: string
}) {


    async function updateResponseScore(score: number) {
        try {
            await gradeStudentResponse(responseId, 0, score)
            toast('Grade Update!')
        } catch (error) {
            console.log('error updating score ', error)
            toast('Grade failed to update')
        }
    }

    return (
        <div className="flex-end w-1/4 absolute right-10 -top-8">
            <Input
                type="text"
                name="journalScore"
                defaultValue={currentScore}
                className="h-7 w-[4.1rem] text-center text-sm"
                placeholder="---"
                maxLength={3}
                onBlur={(e) => updateResponseScore(parseInt(e.target.value))}
            />
            <p className="mx-2 text-md">/</p>
            <p className="text-md">100 </p>
        </div>
    )
}

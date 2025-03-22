import JotListBanner from "@/components/jot-list-banner";
import { Button } from "@/components/ui/button";
import { getAllSessionsInClass } from "@/lib/actions/prompt.session.actions"
import { PromptSession } from "@/types";
import { Plus } from "lucide-react";
import { getStudentCountByClassId } from "@/lib/actions/roster.action";

export default async function Classroom({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {
    const { classId, teacherId } = await params;

    const allPromptSessions = await getAllSessionsInClass(classId) as unknown as PromptSession[]
    const { count: studentCount } = await getStudentCountByClassId(classId)


    return (
        <div className="relative">
            <Button className="absolute top-[0px] right-[2%]" variant='secondary'>
                <Plus />Assign
            </Button>
            <h2 className="text-2xl lg:text-3xl mt-2">Posted Assignments</h2>
            <div className="flex-start flex-wrap gap-7 mt-10">
                {allPromptSessions?.length > 0 ? allPromptSessions.map((prompt: PromptSession) => (
                    <JotListBanner
                        key={prompt.id}
                        jotData={prompt}
                        classId={classId}
                        teacherId={teacherId}
                        classSize={studentCount}
                    />
                )) : (
                    <p>No Jots posted</p>
                )}
            </div>
        </div>
    )
}

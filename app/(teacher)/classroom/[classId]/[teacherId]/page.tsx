import { Button } from "@/components/ui/button";
import { getAllSessionsInClass } from "@/lib/actions/prompt.session.actions"
import { PromptSession } from "@/types";
import { Plus } from "lucide-react";
import { getStudentCountByClassId } from "@/lib/actions/roster.action";
import AssignmentListItem from "@/components/assignment-list-item";
import Link from "next/link";

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
            <Button asChild className="absolute top-[0px] right-[2%]" variant='secondary'>
                <Link href={`/classroom/${classId}/${teacherId}/jots`}>
                    <Plus />Assign
                </Link>
            </Button>
            <h2 className="text-2xl lg:text-3xl mt-2">Posted Assignments</h2>
            <div className="flex-start flex-wrap gap-7 mt-10">
                {allPromptSessions?.length > 0 ? allPromptSessions.map((prompt: PromptSession) => (
                    <AssignmentListItem
                        key={prompt.id}
                        jotData={prompt}
                        classId={classId}
                        teacherId={teacherId}
                        classSize={studentCount}
                    />
                )) : (
                    <p>No Assignments posted</p>
                )}
            </div>
        </div>
    )
}

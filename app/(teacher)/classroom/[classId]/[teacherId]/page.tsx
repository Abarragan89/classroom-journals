import { Button } from "@/components/ui/button";
import { getAllSessionsInClass } from "@/lib/actions/prompt.session.actions"
import { PromptCategory, PromptSession } from "@/types";
import { Plus } from "lucide-react";
import { getStudentCountByClassId } from "@/lib/actions/roster.action";
import Link from "next/link";
import { getAllPromptCategories } from "@/lib/actions/prompt.categories";
import AssignmentListSection from "@/components/shared/AssignmentListSection";

export default async function Classroom({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {
    const { classId, teacherId } = await params;

    const allPromptSessions = await getAllSessionsInClass(classId) as unknown as PromptSession[]
    const allPromptCategories = await getAllPromptCategories(teacherId) as unknown as PromptCategory[]
    const { count: studentCount } = await getStudentCountByClassId(classId)


    return (
        <div className="relative">
            <Button asChild className="absolute top-[5px] right-[2%]" variant='secondary'>
                <Link href={`/classroom/${classId}/${teacherId}/jots`}>
                    <Plus />Assign
                </Link>
            </Button>
            <h2 className="text-2xl lg:text-3xl mt-2">Posted Assignments</h2>
            <div className="gap-7 mt-10">
                <AssignmentListSection
                    initialPrompts={allPromptSessions}
                    categories={allPromptCategories}
                    studentCount={studentCount}
                    classId={classId}
                    teacherId={teacherId}
                />
            </div>
        </div>
    )
}

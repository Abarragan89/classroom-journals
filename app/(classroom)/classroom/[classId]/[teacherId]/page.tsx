import { Button } from "@/components/ui/button";
import { getAllSessionsInClass } from "@/lib/server/prompt-sessions";
import { PromptCategory, PromptSession } from "@/types";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getAllPromptCategories } from "@/lib/server/student-dashboard";
import AssignmentListSection from "@/components/shared/AssignmentListSection";

export default async function Classroom({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {
    const { classId, teacherId } = await params;

    const allPromptSessions = await getAllSessionsInClass(classId, teacherId) as unknown as { prompts: PromptSession[], totalCount: number }
    let allPromptCategories = await getAllPromptCategories(teacherId) as unknown as PromptCategory[]
    allPromptCategories = [{ id: '', name: 'All Categories...' }, ...allPromptCategories]


    return (
        <div className="relative">
            <Button asChild className="absolute top-[40px] right-0">
                <Link href={`/classroom/${classId}/${teacherId}/jots`}>
                    <Plus />Assignment
                </Link>
            </Button>
            <h2 className="text-2xl lg:text-3xl mt-2">Posted Assignments</h2>
            <div className="gap-7 mt-16">
                <AssignmentListSection
                    initialPrompts={allPromptSessions.prompts}
                    categories={allPromptCategories}
                    classId={classId}
                    teacherId={teacherId}
                    promptCountTotal={allPromptSessions.totalCount}
                />
            </div>
        </div>
    )
}

import JotListBanner from "@/components/jot-list-banner";
import { Button } from "@/components/ui/button";
import { getAllSessionsInClass } from "@/lib/actions/prompt.session.actions"
import { PromptSession } from "@prisma/client";
import { Plus } from "lucide-react";

export default async function Classroom({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {
    const { classId, teacherId } = await params;

    const allPromptSessions = await getAllSessionsInClass(classId) as unknown as PromptSession[]

    return (
        <div className="relative">
            <Button className="absolute top-[0px] right-[2%]" variant='secondary'>
                <Plus />Assign
            </Button>
            <h2 className="text-2xl lg:text-3xl mt-2">Posted Assignments</h2>
            <div className="mt-10">
                {allPromptSessions?.length > 0 ? allPromptSessions.map((prompt) => (
                    <JotListBanner
                        key={prompt.id}
                        jotData={prompt}
                        classId={classId}
                        teacherId={teacherId}
                    />
                )) : (
                    <p>No Jots posted</p>
                )}
            </div>
        </div>
    )
}

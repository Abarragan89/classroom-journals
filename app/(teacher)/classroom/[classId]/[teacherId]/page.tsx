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
        <div className="relative max-w-[900px] mx-auto">
            <Button className="absolute top-[-120px] right-[2%]" variant='secondary'>
                <Plus /> Assign Jot
            </Button>
            <div className="w-[95%] max-w-[750px] mt-10 mx-auto">
                <h2 className="text-2xl">Posted Assignments</h2>
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

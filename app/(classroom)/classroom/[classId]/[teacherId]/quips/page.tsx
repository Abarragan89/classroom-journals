import { auth } from "@/auth";
import QuipsClientWraper from "./quips-client-wrapper";
import { getAllQuips } from "@/lib/actions/quips.action";
import { notFound } from "next/navigation";
import { PromptSession } from "@/types";
import { ClassUserRole } from "@prisma/client";

export default async function Quips({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {

    const { classId, teacherId } = await params;

    const session = await auth();

    if (session?.user?.id !== teacherId) {
        return notFound();
    }

    const allQuips = await getAllQuips(classId, teacherId) as PromptSession[]


    return (
        <>
            <div className="relative">
                <h2 className="text-2xl lg:text-3xl mt-2">Posted Quips</h2>
                <QuipsClientWraper
                    classId={classId}
                    teacherId={teacherId}
                    allQuips={allQuips}
                    role={ClassUserRole.TEACHER}
                />
            </div>
        </>
    )
}

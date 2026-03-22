"use client"
import { PromptSession } from "@/types";
import QuipListSection from "@/components/shared/quip-list-section"
import { ClassUserRole } from "@prisma/client"

export default function QuipsClientWraper({
    classId,
    userId,
    allQuips,
    role,
}: {
    classId: string;
    userId: string;
    allQuips: PromptSession[]
    role: ClassUserRole
}) {

    return (
        <>
            <QuipListSection
                allQuips={allQuips}
                role={role}
                userId={userId}
                classId={classId}
            />
        </>
    )
}

"use client"
import { PromptSession } from "@/types";
import QuipListSection from "@/components/shared/quip-list-section"
import { ClassUserRole } from "@prisma/client"

export default function QuipsClientWraper({
    classId,
    teacherId,
    allQuips,
    role,
}: {
    classId: string;
    teacherId: string;
    allQuips: PromptSession[]
    role: ClassUserRole
}) {

    return (
        <>
            <QuipListSection
                allQuips={allQuips}
                role={role}
                userId={teacherId}
                classId={classId}
            />
        </>
    )
}

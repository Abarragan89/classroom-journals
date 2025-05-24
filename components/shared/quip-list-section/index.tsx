"use client"
import { PromptSession } from "@/types"
import QuipListItem from "./quip-list-item"
import { ClassUserRole } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { getAllQuips } from "@/lib/actions/quips.action";

export default function QuipListSection({
    allQuips,
    userId,
    role,
    classId
}: {
    allQuips: PromptSession[];
    userId: string
    role: ClassUserRole;
    classId: string
}) {

    // Get the prompt sessions
    const { data: allQuipData } = useQuery({
        queryKey: ['getAllQuips', classId],
        queryFn: () => getAllQuips(classId, userId) as unknown as PromptSession[],
        initialData: allQuips,
        refetchOnReconnect: false,
    })

    return (
        <section>
            {allQuipData?.length > 0 && allQuipData.map((singleQuip) => (
                <QuipListItem
                    singleQuip={singleQuip}
                    key={singleQuip.id}
                    userId={userId}
                    role={role}
                />
            ))}
        </section>
    )
}

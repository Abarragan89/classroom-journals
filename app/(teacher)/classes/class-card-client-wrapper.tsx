"use client"
import ClassCard from "@/components/shared/class-card"
import { Class } from "@/types"

export default function ClassCardClientWrapper({
    allClassrooms,
    teacherId,
}: {
    allClassrooms: Class[],
    teacherId: string
}) {
    return (
        <div className="mt-8 flex flex-wrap items-start gap-14 mx-auto">
            {allClassrooms.map((classroom: Class) => (
                <ClassCard
                    key={classroom.id}
                    teacherId={teacherId}
                    classData={classroom}
                />
            ))}
        </div>
    )
}

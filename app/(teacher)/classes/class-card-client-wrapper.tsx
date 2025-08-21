"use client"
import ClassCard from "@/components/shared/class-card"
import { Class } from "@/types"
import { useQuery } from "@tanstack/react-query"

export default function ClassCardClientWrapper({
    allClassrooms,
    teacherId,
}: {
    allClassrooms: Class[],
    teacherId: string
}) {

    const { data: teacherClassrooms} = useQuery({
        queryKey: ['teacherClassrooms', teacherId],
        queryFn: async () => {
            const response = await fetch(`/api/classrooms/teacher-classrooms?teacherId=${teacherId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch teacher classrooms");
            }
            const data = await response.json();
            return data.classrooms;
        },
        initialData: allClassrooms,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: 1000 * 60 * 60 * 5, // 5 hours
    })

    return (
        <div className="mt-10 flex flex-wrap items-start gap-14 mx-auto">
            {teacherClassrooms.map((classroom: Class) => (
                <ClassCard
                    key={classroom.id}
                    teacherId={teacherId}
                    classData={classroom}
                />
            ))}
        </div>
    )
}

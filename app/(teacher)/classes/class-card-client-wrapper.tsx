"use client"
import AddClassBtn from "@/components/forms/class-forms/add-class-btn"
import ClassCard from "@/components/shared/class-card"
import { Class, Session } from "@/types"
import { useQuery } from "@tanstack/react-query"

export default function ClassCardClientWrapper({
    allClassrooms,
    teacherId,
    session
}: {
    allClassrooms: Class[],
    teacherId: string,
    session: Session
}) {

    // make a userQuery() with initial data of allClassrooms to cache data and update later. key is 'teacherClassrooms', teacherId
    const { data: classrooms } = useQuery({
        queryKey: ['teacherClassrooms', teacherId],
        queryFn: async () => {
            const response = await fetch(`/api/classrooms/teacher-classrooms/${teacherId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch classrooms');
            }
            const { classrooms } = await response.json();
            return classrooms as Class[];
        },
        initialData: allClassrooms
    })

    return (
        <div className="mt-8 flex flex-wrap items-start gap-14 mx-auto">
            {classrooms?.length > 0 ? classrooms.map((classroom: Class) => (
                <ClassCard
                    key={classroom.id}
                    teacherId={teacherId}
                    classData={classroom}
                />
            )) : (
                <>
                    <div className="flex flex-col mx-auto items-center justify-center text-primary mt-5">
                        {session.googleProviderId && (
                            <p className="mb-3 font-medium text-lg">Create a Classroom to Get Started!</p>
                        )}
                        <div className="w-[90%] max-w-[150px]">
                            <AddClassBtn
                                variant='default'
                                teacherId={teacherId}
                                closeSubMenu={undefined}
                                session={session as Session}
                                isAllowedToMakeNewClass={true}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

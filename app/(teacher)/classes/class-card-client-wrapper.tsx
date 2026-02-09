"use client"
import AddClassBtn from "@/components/forms/class-forms/add-class-btn"
import ClassCard from "@/components/shared/class-card"
import { Class, Session } from "@/types"
import { Separator } from "@/components/ui/separator"
import { useQuery } from "@tanstack/react-query"
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

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
        initialData: allClassrooms,
        staleTime: 1000 * 60 * 5, // 5 minutes
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
                <div className="w-full sm:w-2/3 lg:w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="bg-card border shadow-sm rounded-lg p-8 sm:p-10 text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Welcome to JotterBlog!</h2>
                        <p className="text-muted-foreground mb-5 text-base sm:text-lg">
                            Step 1: Create your first Class.
                        </p>
                        <div className="flex flex-col items-center gap-4">
                            <div className="scale-110 w-1/2 mx-auto text-lg">
                                <AddClassBtn
                                    variant='default'
                                    teacherId={teacherId}
                                    closeSubMenu={undefined}
                                    session={session as Session}
                                    isAllowedToMakeNewClass={true}
                                />
                            </div>
                        </div>

                    </div>
                    <div className="scale-x-105 origin-center rounded-lg mx-3 shadow-lg">
                        <LiteYouTubeEmbed
                            id="IZ9b6dTi56M"
                            title={`JotterBlog Tutorial - Classes`}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

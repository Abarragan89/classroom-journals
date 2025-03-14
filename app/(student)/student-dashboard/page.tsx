import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { prisma } from "@/db/prisma";
import { Session } from "@/types";
import { notFound } from "next/navigation";

export default async function StudentDashboard() {

    const session = await auth() as Session

    if (!session) notFound()

    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'student' || !studentId) {
        notFound()
    }

    const classroomId = session?.classroomId


    const classroomData = await prisma.classroom.findUnique({
        where: { id: classroomId },
        include: {
            users: true,
            PromptSession: true
        }
    })


    return (
        <div>
            <Header session={session} />
            <main className="wrapper">
                <h1 className="h1-bold mt-2 line-clamp-1">{classroomData?.name}</h1>
                {/* 
            {classroomData.map(() => (

            ))} */}
            </main>
        </div>
    )
}

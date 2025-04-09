import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { Session } from "@/types";
import { notFound } from "next/navigation";

export default async function StudentGrades() {

    const session = await auth() as Session

    if (!session) notFound()

    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'student' || !studentId) {
        notFound()
    }

    const classroomId = session?.classroomId
    console.log('classroomId', classroomId)



    return (
        <>
            <Header session={session} studentId={studentId} />
            <main>
                <p>Notifications</p>
            </main>
        </>
    )
}

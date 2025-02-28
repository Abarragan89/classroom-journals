import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Header from "@/components/shared/header"

export default async function Classroom({ params }: { params: Promise<{ classId: string }> }) {
    const session = await auth()

    if (!session) {
        redirect('/')
    }

    const teacherId = session?.user?.id as string
    if (!teacherId) redirect('/')

    const classroomId = (await params).classId
    // Look up class

    // make sure it belongs to the teacher

    return (
        <>
            <Header teacherId={teacherId} inClassroom={true}/>
        </>
    )
}

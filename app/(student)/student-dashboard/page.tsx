import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { PromptCategory, Response, Session, StudentRequest } from "@/types";
import { notFound } from "next/navigation";
import { getAllPromptCategories } from "@/lib/actions/prompt.categories";
import { getDecyptedStudentUsername, getFeaturedBlogs, getTeacherId } from "@/lib/actions/student.dashboard.actions";
import { getStudentRequests } from "@/lib/actions/student-request";
import StudentDashClientWrapper from "./student-dash-client-wrapper";
import { getStudentResponsesDashboard } from "@/lib/actions/response.action";


export default async function StudentDashboard() {

    const session = await auth() as Session

    if (!session) return notFound()

    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'STUDENT' || !studentId) {
        return notFound()
    }

    const classroomId = session?.classroomId

    if (!classroomId) return notFound()

    const studentName = await getDecyptedStudentUsername(studentId)
    const teacherId = await getTeacherId(classroomId) as string

    if (!studentName || !teacherId) {
        return notFound()
    }
    const allPromptCategories = await getAllPromptCategories(teacherId) as unknown as PromptCategory[]
    const allResponses = await getStudentResponsesDashboard(studentId) as unknown as { responses: Response[], totalCount: number }

    const featuredBlogs = await getFeaturedBlogs(classroomId) as unknown as Response[]
    const studentRequests = await getStudentRequests(studentId) as unknown as StudentRequest[]

    return (
        <>
            <Header session={session} studentId={studentId} />
            <main className="wrapper relative">
                <h1 className="h2-bold mt-2 line-clamp-1 mb-10">Hi, {studentName as string}</h1>
                <StudentDashClientWrapper
                    allCategories={allPromptCategories}
                    allResponses={allResponses}
                    featuredBlogs={featuredBlogs}
                    studentRequests={studentRequests}
                    studentId={studentId}
                    teacherId={teacherId}
                    classroomId={classroomId}
                />
            </main>
        </>
    )
}

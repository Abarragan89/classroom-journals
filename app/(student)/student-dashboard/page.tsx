import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { PromptCategory, Response, Session, StudentRequest } from "@/types";
import { notFound } from "next/navigation";
import StudentDashClientWrapper from "./student-dash-client-wrapper";
import { getStudentResponsesDashboard } from "@/lib/server/responses";
import { getAllQuipAlerts } from "@/lib/server/alerts";
import {
    // getStudentName,
    getAllPromptCategories,
    getFeaturedBlogs,
    getStudentRequests
} from "@/lib/server/student-dashboard";


export default async function StudentDashboard() {

    const session = await auth() as Session

    if (!session) return notFound()

    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'STUDENT' || !studentId) {
        return notFound()
    }

    const classroomId = session?.classroomId
    if (!classroomId) return notFound()

    const teacherId = session?.teacherId
    if (!teacherId) return notFound()


    // Get all remaining data in parallel
    const [
        allPromptCategories,
        allResponses,
        featuredBlogs,
        studentRequests,
        quipAlerts
    ] = await Promise.all([
        getAllPromptCategories(teacherId as string),
        getStudentResponsesDashboard(studentId, session),
        getFeaturedBlogs(classroomId),
        getStudentRequests(studentId),
        getAllQuipAlerts(studentId),
    ]);

    return (
        <>
            <Header session={session} studentId={studentId} />
            <main className="wrapper relative">
                <StudentDashClientWrapper
                    allCategories={allPromptCategories as PromptCategory[]}
                    allResponses={allResponses as { responses: Response[], totalCount: number }}
                    featuredBlogs={featuredBlogs as unknown as Response[]}
                    studentRequests={studentRequests as unknown as StudentRequest[]}
                    studentId={studentId}
                    teacherId={teacherId as string}
                    classroomId={classroomId}
                    quipAlerts={quipAlerts as number}
                />
            </main>
        </>
    )
}

import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { PromptCategory, Response, Session, StudentRequest } from "@/types";
import { notFound } from "next/navigation";
import StudentDashClientWrapper from "./student-dash-client-wrapper";
import { getStudentResponsesDashboard } from "@/lib/server/responses";
import { getAllQuipAlerts } from "@/lib/server/alerts";
import {
    getStudentName,
    getTeacherId,
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

    // STEP 1: Get dependencies first (run in parallel)
    const [studentName, teacherId] = await Promise.all([
        getStudentName(studentId),
        getTeacherId(classroomId)
    ]);


    // STEP 2: Get all remaining data in parallel
    const [
        allPromptCategories,
        allResponses,
        featuredBlogs,
        studentRequests,
        quipAlerts
    ] = await Promise.all([
        getAllPromptCategories(teacherId as string),
        getStudentResponsesDashboard(studentId),
        getFeaturedBlogs(classroomId),
        getStudentRequests(studentId),
        getAllQuipAlerts(studentId)
    ]);

    return (
        <>
            <Header session={session} studentId={studentId} />
            <main className="wrapper relative">
                <h1 className="h2-bold mt-2 line-clamp-1 mb-10">Hi, {studentName as string}</h1>
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

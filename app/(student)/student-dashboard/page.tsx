import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { PromptCategory, Response, Session, StudentRequest } from "@/types";
import { notFound } from "next/navigation";
import { getAllPromptCategories } from "@/lib/actions/prompt.categories";
import { getDecyptedStudentUsername, getFeaturedBlogs, getTeacherId } from "@/lib/actions/student.dashboard.actions";
import { getStudentRequests } from "@/lib/actions/student.dashboard.actions";
import StudentDashClientWrapper from "./student-dash-client-wrapper";
import { getStudentResponsesDashboard } from "@/lib/actions/response.action";
import { getAllQuipAlerts } from "@/lib/actions/alert.action";


export default async function StudentDashboard() {

    // const session = await auth() as Session

    // if (!session) return notFound()

    // const studentId = session?.user?.id as string
    // if (session?.user?.role !== 'STUDENT' || !studentId) {
    //     return notFound()
    // }

    // const classroomId = session?.classroomId

    // if (!classroomId) return notFound()

    // // STEP 1: Get dependencies first (run in parallel)
    // const [studentName, teacherId] = await Promise.all([
    //     getDecyptedStudentUsername(studentId),
    //     getTeacherId(classroomId)
    // ]);

    // if (!studentName || !teacherId) {
    //     return notFound()
    // }


    const session = (await auth()) as Session;
    console.log('session', session);

    if (!session) return notFound();

    const studentId = session.user?.id as string;
    if (session.user?.role !== "STUDENT" || !studentId) {
        return notFound();
    }

    const classroomId = session.classroomId;
    if (!classroomId) return notFound();

    // STEP 1: Fetch dependencies in parallel
    const [studentNameRes, teacherIdRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/student-dashboard/username?studentId=${studentId}`),
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/student-dashboard/get-teacher-id?classroomId=${classroomId}`),
    ]);

    console.log('studentNameRes', studentNameRes);
    console.log('teacherIdRes', teacherIdRes);

    if (!studentNameRes.ok || !teacherIdRes.ok) return notFound();

    const { username: studentName } = await studentNameRes.json();
    const { teacherId } = await teacherIdRes.json();

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

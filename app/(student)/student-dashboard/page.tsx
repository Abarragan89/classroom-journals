import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { PromptCategory, Response, Session, StudentRequest } from "@/types";
import { notFound } from "next/navigation";
import { getStudentRequests } from "@/lib/actions/student.dashboard.actions";

import StudentDashClientWrapper from "./student-dash-client-wrapper";
import { getStudentResponsesDashboard } from "@/lib/actions/response.action";
import { getAllQuipAlerts } from "@/lib/actions/alert.action";
import { 
    getStudentName, 
    getTeacherId, 
    getAllPromptCategories, 
    getFeaturedBlogs 
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

    const featuredBlogs1 = await getFeaturedBlogs(classroomId);
    console.log('featuredBlogs', featuredBlogs1);

    // STEP 1: Get dependencies first (run in parallel)
    const [studentName, teacherId] = await Promise.all([
        getStudentName(studentId),
        getTeacherId(classroomId)
    ]);


    // const studentName = await getDecyptedStudentUsername(studentId);
    // const teacherId = await getTeacherId(classroomId);

    // if (!studentName || !teacherId) {
    //     return notFound()
    // }


    // const session = (await auth()) as Session;
    // console.log('session asdfasdf', session);

    // if (!session) return notFound();

    // const studentId = session.user?.id as string;
    // if (session.user?.role !== "STUDENT" || !studentId) {
    //     return notFound();
    // }

    // const classroomId = session?.classroomId
    // if (!classroomId) return notFound()

    // const [teacherId, studentName] = await Promise.all([
    //     getTeacherId(classroomId),
    //     getStudentName(studentId)
    // ]);


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

    // const allPromptCategories = await getAllPromptCategories(teacherId as string);
    // const allResponses = await getStudentResponsesDashboard(studentId);
    // const featuredBlogs = await getFeaturedBlogs(classroomId);
    // const studentRequests = await getStudentRequests(studentId);
    // const quipAlerts = await getAllQuipAlerts(studentId);


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

import { markAllRequestsAsViewed } from "@/lib/actions/student-request"
import { getTeacherRequests } from "@/lib/server/student-requests";
import StudentRequestSection from "./student-request-section";
import { StudentRequest } from "@/types";
import { notFound } from "next/navigation";

export default async function StudentRequests({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {

    const { teacherId, classId } = await params;
    if (!teacherId) return notFound()

    const [studentRequests] = await Promise.all([
        getTeacherRequests(teacherId, classId) as unknown as StudentRequest[],
        markAllRequestsAsViewed(teacherId, classId)
    ])

    return (
        <div>
            <h2 className="h2-bold my-3">Student Requests</h2>
            <StudentRequestSection
                classId={classId}
                teacherId={teacherId}
                studentRequests={studentRequests}
            />
        </div>
    )
}

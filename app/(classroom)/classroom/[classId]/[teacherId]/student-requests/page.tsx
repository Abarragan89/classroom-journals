import { getTeacherRequests, markAllRequestsAsViewed } from "@/lib/actions/student-request"
import StudentRequestSection from "./student-request-section";
import { StudentRequest } from "@/types";
import { notFound } from "next/navigation";

export default async function StudentRequests({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {

    const { teacherId } = await params;
    if (!teacherId) notFound()

    const studentRequests = await getTeacherRequests(teacherId) as unknown as StudentRequest[]

    // mark requests as viewd
    await markAllRequestsAsViewed(teacherId)

    return (
        <div>
            <h2 className="text-2xl lg:text-3xl mt-2">Student Requests</h2>
            <StudentRequestSection
                teacherId={teacherId}
                studentRequests={studentRequests}
            />
        </div>
    )
}

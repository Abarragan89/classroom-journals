import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { getUserNotifications } from "@/lib/actions/notifications.action";
import { Session, UserNotification } from "@/types";
import { notFound } from "next/navigation";

export default async function StudentNotifications() {

    const session = await auth() as Session

    if (!session) notFound()

    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'student' || !studentId) {
        notFound()
    }

    const classroomId = session?.classroomId
    if (!classroomId) notFound()

    const userNotifications = await getUserNotifications(studentId) as unknown as UserNotification[]



    return (
        <>
            <Header session={session} studentId={studentId} />
            <main>
                <p>Notifications</p>
            </main>
        </>
    )
}

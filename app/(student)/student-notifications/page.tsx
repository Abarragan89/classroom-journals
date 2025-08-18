import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { markAllNotificationsAsRead } from "@/lib/actions/notifications.action";
import { getUserNotifications } from "@/lib/server/notifications";
import { Session, UserNotification } from "@/types";
import { notFound } from "next/navigation";
import NotificationSection from "./notification-section";

export default async function StudentNotifications() {

    const session = await auth() as Session

    if (!session) return notFound()

    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'STUDENT' || !studentId) {
        return notFound()
    }

    const classId = session?.classroomId
    if (!classId) return notFound()

    const [userNotifications] = await Promise.all([
        getUserNotifications(studentId, classId) as unknown as UserNotification[],
        markAllNotificationsAsRead(studentId, classId)
    ])


    return (
        <>
            <Header session={session} studentId={studentId} />
            <main className="wrapper">
                <h1 className="h2-bold mt-2 line-clamp-1">Notifications</h1>
                <NotificationSection
                    userId={studentId}
                    classId={classId}
                    notifications={userNotifications}
                />
            </main>
        </>
    )
}

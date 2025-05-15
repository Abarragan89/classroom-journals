import NotificationSection from "@/app/(student)/student-notifications/notification-section";
import { getUserNotifications, markAllNotificationsAsRead } from "@/lib/actions/notifications.action"
import { UserNotification } from "@/types";

export default async function Notifications({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {

    const { teacherId, classId } = await params;

    const teacherNotifications = await getUserNotifications(teacherId, classId) as unknown as UserNotification[];

    if (teacherNotifications.length > 0) await markAllNotificationsAsRead(teacherId, classId)

    return (
        <div>
            <h2 className="text-2xl lg:text-3xl mt-2">Notifications</h2>
            <NotificationSection
                userId={teacherId}
                classId={classId}
                notifications={teacherNotifications}
            />
        </div>
    )
}


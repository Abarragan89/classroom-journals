import NotificationSection from "@/app/(student)/student-notifications/notification-section";
import { markAllNotificationsAsRead } from "@/lib/actions/notifications.action"
import { getUserNotifications } from "@/lib/server/notifications";
import { UserNotification } from "@/types";

export default async function Notifications({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {

    const { teacherId, classId } = await params;

    const [teacherNotifications] = await Promise.all([
        getUserNotifications(teacherId, classId) as unknown as UserNotification[],
        markAllNotificationsAsRead(teacherId, classId)
    ])

    return (
        <div>
            <h2 className="h2-bold my-3">Notifications</h2>
            <NotificationSection
                userId={teacherId}
                classId={classId}
                notifications={teacherNotifications}
            />
        </div>
    )
}


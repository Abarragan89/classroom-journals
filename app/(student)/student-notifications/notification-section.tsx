"use client";
import { useState } from "react";
import { clearAllNotifications } from "@/lib/actions/notifications.action";
import { UserNotification } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { formatDateLong } from "@/lib/utils";
import { Button } from "@/components/ui/button";


export default function NotificationSection({
    notifications,
    studentId,
}: {
    notifications: UserNotification[],
    studentId: string
}) {
    const [notificationsState, setNotificaitonsState] = useState<UserNotification[]>(notifications)

    async function clearNotifications() {
        try {
            clearAllNotifications(studentId)
            setNotificaitonsState([])
        } catch (error) {
            console.log('error clearing all notifications', error)
        }
    }

    return (
        <section className="max-w-[500px] mx-auto mt-10">
            {notificationsState.length > 0 ? (
                <>
                    <div className="flex-end">
                        <Button
                            variant='link'
                            onClick={clearNotifications}
                            className="text-destructive p-0 mr-0 block"
                        >
                            Clear Notifications
                        </Button>
                    </div>
                    <div className="space-y-5">
                        {notificationsState.map((notification: UserNotification) => (
                            <Card className="relative max-w-[500px] mx-auto" key={notification?.id}>
                                <CardContent className="flex items-center justify-center py-3">
                                    <Link key={notification.id} href={notification.url}
                                        className="h-[80px] text-xs flex flex-col justify-between items-center opacity-80 hover:opacity-100"
                                    >
                                        <p className="text-center">{notification.message}</p>
                                        <p className="text-sm text-center line-clamp-1 overflow-x-clip italic font-bold text-foreground">&ldquo;{notification?.commentText?.slice(0, 25)}&rdquo;</p>
                                        <p>on: {formatDateLong(notification.createdAt)}</p>
                                    </Link>

                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            ) : (
                <h3 className="h3-bold text-accent italic text-center">No Notifications</h3>
            )}
        </section>
    )
}

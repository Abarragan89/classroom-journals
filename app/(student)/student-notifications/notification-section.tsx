"use client";
import { useState } from "react";
import {
    clearAllNotifications,
    getUserNotifications,
    markAllNotificationsAsRead
} from "@/lib/actions/notifications.action";
import { UserNotification } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { formatDateLong } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

export default function NotificationSection({
    notifications,
    userId,
    classId
}: {
    notifications: UserNotification[],
    userId: string,
    classId: string
}) {

    const queryClient = useQueryClient()


    const { error } = useQuery({
        queryKey: ['getUserNotifications', userId],
        queryFn: async () => {
            const userNotifications = await getUserNotifications(userId) as unknown as UserNotification[]
            setNotificaitonsState(userNotifications)
            if (userNotifications.length > 0) await markAllNotificationsAsRead(userId)
            return userNotifications;
        },
        initialData: notifications,
    })

    if (error) {
        throw new Error('Error getting user notifications')
    }


    const [notificationsState, setNotificaitonsState] = useState<UserNotification[]>(notifications)

    async function clearNotifications() {
        try {
            clearAllNotifications(userId)
            queryClient.invalidateQueries({
                queryKey: ['getTeacherNotifications', classId],
            })
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
                                        className="h-[80px] w-full text-xs flex flex-col justify-between items-center opacity-80 hover:opacity-100"
                                    >
                                        <p className="text-center">{notification.message}</p>
                                        <p className="text-sm text-center italic font-bold text-foreground my-2 line-clamp-2">&ldquo;{notification?.commentText}&rdquo;</p>
                                        <p>on: {formatDateLong(notification.createdAt)}</p>
                                    </Link>

                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            ) : (
                <h3 className="text-2xl text-accent italic text-center">No Notifications</h3>
            )}
        </section>
    )
}

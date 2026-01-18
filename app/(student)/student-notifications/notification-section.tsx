"use client";
import { useState, useEffect } from "react";
import {
    clearAllNotifications,
    markAllNotificationsAsRead
} from "@/lib/actions/notifications.action";
import { UserNotification } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { formatDateLong } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export default function NotificationSection({
    notifications,
    userId,
    classId,
}: {
    notifications: UserNotification[],
    userId: string,
    classId: string,
}) {

    const queryClient = useQueryClient();
    const [notificationsState, setNotificaitonsState] = useState<UserNotification[]>(notifications);

    // Mark all notifications as read on component mount
    useEffect(() => {
        if (notifications.length > 0) {
            markAllNotificationsAsRead(userId, classId);
        }
    }, []); // Empty dependency array - only run once on mount

    async function clearNotifications() {
        try {
            clearAllNotifications(userId, classId)
            // Optimistically update cache to empty array
            queryClient.setQueryData<UserNotification[]>(['getUserNotifications', userId], [])
            setNotificaitonsState([])
        } catch (error) {
            console.error('error clearing all notifications', error)
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
                                        className="h-[85px] w-full text-xs flex flex-col justify-between items-center opacity-80 hover:opacity-100"
                                    >
                                        <p className="text-center">{notification.message}</p>
                                        <p className="text-sm text-center italic font-bold text-foreground my-2 line-clamp-2 break-words">&ldquo;{notification?.commentText}&rdquo;</p>
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

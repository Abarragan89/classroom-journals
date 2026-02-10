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
                <div className="flex flex-col justify-between bg-card border shadow-sm rounded-lg p-8 text-center max-w-[500px]">
                    <div className='xl:max-h-[100px]'>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-5">No Notifications</h2>
                        <p className="text-muted-foreground mb-5 text-base sm:text-lg font-medium">
                            Monitor student blog comments here to ensure discussions stay appropriate.
                        </p>
                    </div>
                </div>
            )}
        </section>
    )
}

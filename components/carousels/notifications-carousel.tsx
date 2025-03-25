'use client'
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { UserNotification } from "@/types"
import Link from "next/link";
import { formatDateLong } from "@/lib/utils";
import { Button } from "../ui/button";
import { clearAllNotifications } from "@/lib/actions/notifications.action";

export default function NotificationsCarousel({
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
            console.log('error clearing all notifications')
        }
    }

    return (
        <>
            <Carousel
                opts={{
                    align: "start",
                }}
                className="w-[90%] max-w-[900px] mx-auto border border-border p-10 rounded-lg"
            >
                <Button variant='destructive' onClick={clearNotifications}>Clear All</Button>
                <CarouselContent>
                    {notificationsState?.length > 0 && notificationsState.map((notification: UserNotification) => (
                        <CarouselItem key={notification.id} className="md:basis-1/2 lg:basis-1/3">
                            <Card className="relative max-w-[350px] mx-auto">
                                <CardContent className="flex items-center justify-center">
                                    <Link key={notification.id} href={notification.url}>
                                        <p className="text-xs">{notification.message}</p>
                                        <p className="text-sm text-center">{notification.commentText}</p>
                                    </Link>

                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </>
    )
}

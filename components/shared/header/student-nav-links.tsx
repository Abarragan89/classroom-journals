'use client'
import { Bell, ClipboardPen, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getUnreadUserNotifications } from '@/lib/actions/notifications.action';


export default function StudentNavLinks({
    studentId
}: {
    studentId: string
}) {
    const pathname = usePathname().split('/')[1];

    const [notificationCount, setNotificationCount] = useState<number>(0)

    useEffect(() => {
        async function getNotifications() {
            if (studentId) {
                const newNotificaitonCount = await getUnreadUserNotifications(studentId)
                setNotificationCount(newNotificaitonCount as number)
            }
        }
        getNotifications();
    }, [studentId, pathname])

    return (
        <>

            <Link href={`/student-dashboard`} className={`
            flex-center hover:cursor-pointer hover:text-primary text-sm
            ${pathname === 'student-dashboard' ? 'text-primary underline' : 'text-ring'}  
            `}>
                <LayoutDashboard size={16} className='mr-1' />Dashboard
            </Link>

            <Link href={`/my-work`} className={`
                flex-center hover:cursor-pointer hover:text-primary min-w-[90px] text-sm
                ${pathname === 'my-work' ? 'text-primary underline' : 'text-ring'}    
                `}>
                <ClipboardPen size={16} className='mr-1' />My Work
            </Link>
            <div className='relative'>
                {notificationCount > 0 && (
                    <p className='opacity-80 text-center min-w-5 absolute top-[-10px] right-[-16px] py-[2px] rounded-full bg-destructive text-destructive-foreground text-xs'
                    >
                        {notificationCount}
                    </p>
                )}
                <Link href={`/student-notifications`} className={`
                flex-center hover:cursor-pointer hover:text-primary text-sm
                ${pathname === 'student-notifications' ? 'text-primary underline' : 'text-ring'}    
                `}>
                    <Bell size={16} className='mr-1' />Notifications
                </Link>
            </div>
        </>
    )
}

'use client'
import { Bell, LayoutDashboard, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import { getUnreadUserNotifications } from '@/lib/actions/notifications.action';
import { useQuery } from '@tanstack/react-query';


export default function StudentNavLinks({
    studentId,
    classId
}: {
    studentId: string,
    classId: string
}) {
    const pathname = usePathname().split('/')[1];

    const { data: notificationCount } = useQuery({
        queryKey: ['getStudentNotificationHeader', studentId],
        queryFn: () => getUnreadUserNotifications(studentId, classId) as unknown as number,
        placeholderData: 0,
        // refetchOnMount: false,
        // refetchOnReconnect: false,
        // refetchOnWindowFocus: false,
        // staleTime: Infinity,
    })

    return (
        <>

            <Link href={`/student-dashboard`} className={`
            flex-center hover:cursor-pointer hover:text-foreground text-sm
            ${pathname === 'student-dashboard' ? 'text-foreground underline' : 'text-accent'}  
            `}>
                <LayoutDashboard size={16} className='mr-1' />Dashboard
            </Link>
            <Link href={`/student-profile`} className={`
                flex-center hover:cursor-pointer hover:text-foreground min-w-[90px] text-sm
                ${pathname === 'student-profile' ? 'text-foreground underline' : 'text-accent'}    
                `}>
                <User size={17} className='mr-1' />Profile
            </Link>
            <div className='relative'>
                {notificationCount !== undefined && notificationCount > 0 && (
                    <p className='opacity-80 text-center min-w-5 absolute top-[-10px] right-[-16px] py-[2px] rounded-full bg-destructive text-destructive-foreground text-xs'
                    >
                        {notificationCount}
                    </p>
                )}
                <Link href={`/student-notifications`} className={`
                flex-center hover:cursor-pointer hover:text-foreground text-sm
                ${pathname === 'student-notifications' ? 'text-foreground underline' : 'text-accent'}    
                `}>
                    <Bell size={16} className='mr-1' />Notifications
                </Link>
            </div>
        </>
    )
}

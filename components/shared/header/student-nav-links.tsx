'use client'
import { Bell, LayoutDashboard, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation';
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
        queryFn: async () => {
            const response = await fetch(`/api/notifications/unread?userId=${studentId}&classId=${classId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch unread notifications');
            }
            const { unreadCount } = await response.json();
            return unreadCount as number;
        },
        placeholderData: 0,
        staleTime: 1000 * 60 * 2, // 2 minutes
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    })

    return (
        <>

            <Link href={`/student-dashboard`} className={`
            flex-start hover:cursor-pointer hover:text-foreground text-sm
            ${pathname === 'student-dashboard' ? 'text-foreground underline' : 'text-accent'}  
            `}>
                <LayoutDashboard size={16} className='mr-1' />Dashboard
            </Link>
            <Link href={`/student-profile`} className={`
                flex-center hover:cursor-pointer hover:text-foreground text-sm
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

'use client'
import { Bell, LayoutDashboard, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';


export default function StudentNavLinks({
    studentId,
    classId,
    isMobile = false,
    onNavigate
}: {
    studentId: string,
    classId: string,
    isMobile?: boolean,
    onNavigate?: () => void
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
    })

    if (isMobile) {
        return (
            <>
                <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start gap-3 px-4 py-3 h-auto text-sm font-normal rounded-md hover:bg-accent text-muted-foreground"
                >
                    <Link href={`/student-dashboard`} onClick={onNavigate}>
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </Link>
                </Button>
                <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start gap-3 px-4 py-3 h-auto text-sm font-normal rounded-md hover:bg-accent text-muted-foreground"
                >
                    <Link href={`/student-profile`} onClick={onNavigate}>
                        <User size={18} />
                        <span>Profile</span>
                    </Link>
                </Button>
                <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start gap-3 px-4 py-3 h-auto text-sm font-normal rounded-md hover:bg-accent text-muted-foreground"
                >
                    <Link href={`/student-notifications`} onClick={onNavigate}>
                        <Bell size={18} />
                        <span>Notifications</span>
                        {notificationCount !== undefined && notificationCount > 0 && (
                            <span className='ml-auto min-w-5 px-2 py-[2px] rounded-full bg-destructive text-destructive-foreground text-xs'>
                                {notificationCount}
                            </span>
                        )}
                    </Link>
                </Button>
            </>
        )
    }

    return (
        <>
            <Link href={`/student-dashboard`} className={`
            flex-start hover:cursor-pointer hover:text-foreground text-sm
            ${pathname === 'student-dashboard' ? 'text-foreground' : 'text-muted-foreground'}  
            `}>
                <LayoutDashboard size={16} className='mr-1' />Dashboard
            </Link>
            <Link href={`/student-profile`} className={`
                ml-3 flex-center hover:cursor-pointer hover:text-foreground text-sm
                ${pathname === 'student-profile' ? 'text-foreground' : 'text-muted-foreground'}    
                `}>
                <User size={17} className='mr-1' />Profile
            </Link>
            <div className='relative ml-3'>
                {notificationCount !== undefined && notificationCount > 0 && (
                    <p className='opacity-80 text-center min-w-5 absolute top-[-10px] right-[-16px] py-[2px] rounded-full bg-destructive text-destructive-foreground text-xs'
                    >
                        {notificationCount}
                    </p>
                )}
                <Link href={`/student-notifications`} className={`
                flex-center hover:cursor-pointer hover:text-foreground text-sm
                ${pathname === 'student-notifications' ? 'text-foreground' : 'text-muted-foreground'}    
                `}>
                    <Bell size={16} className='mr-1' />Notifications
                </Link>
            </div>
        </>
    )
}

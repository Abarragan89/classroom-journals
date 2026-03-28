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
                    <Link
                        href={`/student-dashboard`}
                        onClick={onNavigate}
                        aria-current={pathname === 'student-dashboard' ? 'page' : undefined}
                    >
                        <LayoutDashboard size={18} aria-hidden="true" />
                        <span>Dashboard</span>
                    </Link>
                </Button>
                <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start gap-3 px-4 py-3 h-auto text-sm font-normal rounded-md hover:bg-accent text-muted-foreground"
                >
                    <Link
                        href={`/student-profile`}
                        onClick={onNavigate}
                        aria-current={pathname === 'student-profile' ? 'page' : undefined}
                    >
                        <User size={18} aria-hidden="true" />
                        <span>Profile</span>
                    </Link>
                </Button>
                <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start gap-3 px-4 py-3 h-auto text-sm font-normal rounded-md hover:bg-accent text-muted-foreground"
                >
                    <Link
                        href={`/student-notifications`}
                        onClick={onNavigate}
                        aria-current={pathname === 'student-notifications' ? 'page' : undefined}
                    >
                        <Bell size={18} aria-hidden="true" />
                        <span>Notifications</span>
                        {notificationCount !== undefined && notificationCount > 0 && (
                            <span
                                className='ml-auto min-w-5 px-2 py-[2px] rounded-full bg-destructive text-destructive-foreground text-xs'
                                aria-label={`${notificationCount} unread`}
                            >
                                <span aria-hidden="true">{notificationCount}</span>
                            </span>
                        )}
                    </Link>
                </Button>
            </>
        )
    }

    return (
        <>
            <Link
                href={`/student-dashboard`}
                aria-current={pathname === 'student-dashboard' ? 'page' : undefined}
                className={`
            flex-start hover:cursor-pointer hover:text-foreground text-sm
            ${pathname === 'student-dashboard' ? 'text-foreground' : 'text-muted-foreground'}  
            `}>
                <LayoutDashboard size={16} className='mr-1' aria-hidden="true" />Dashboard
            </Link>
            <Link
                href={`/student-profile`}
                aria-current={pathname === 'student-profile' ? 'page' : undefined}
                className={`
                ml-3 flex-center hover:cursor-pointer hover:text-foreground text-sm
                ${pathname === 'student-profile' ? 'text-foreground' : 'text-muted-foreground'}    
                `}>
                <User size={17} className='mr-1' aria-hidden="true" />Profile
            </Link>
            <div className='relative ml-3'>
                {notificationCount !== undefined && notificationCount > 0 && (
                    <p
                        className='opacity-80 text-center min-w-5 absolute top-[-10px] right-[-16px] py-[2px] rounded-full bg-destructive text-destructive-foreground text-xs'
                        aria-label={`${notificationCount} unread notifications`}
                    >
                        <span aria-hidden="true">{notificationCount}</span>
                    </p>
                )}
                <Link
                    href={`/student-notifications`}
                    aria-current={pathname === 'student-notifications' ? 'page' : undefined}
                    className={`
                flex-center hover:cursor-pointer hover:text-foreground text-sm
                ${pathname === 'student-notifications' ? 'text-foreground' : 'text-muted-foreground'}    
                `}>
                    <Bell size={16} className='mr-1' aria-hidden="true" />Notifications
                </Link>
            </div>
        </>
    )
}

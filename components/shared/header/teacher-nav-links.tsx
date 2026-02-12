'use client'
import { GraduationCap, PenTool } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function TeacherNavLinks({ isMobile = false, onNavigate }: { isMobile?: boolean; onNavigate?: () => void }) {
    const pathname = usePathname().split('/')[1];

    if (isMobile) {
        return (
            <>
                <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start gap-3 px-4 py-3 h-auto text-sm font-normal rounded-md hover:bg-accent text-muted-foreground"
                >
                    <Link href={`/classes`} onClick={onNavigate}>
                        <GraduationCap size={18} />
                        <span>Classes</span>
                    </Link>
                </Button>

                <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start gap-3 px-4 py-3 h-auto text-sm font-normal rounded-md hover:bg-accent text-muted-foreground"
                >
                    <Link href={`/prompt-library`} onClick={onNavigate}>
                        <PenTool size={18} />
                        <span>My Jots</span>
                    </Link>
                </Button>
            </>
        )
    }

    return (
        <>
            <Link href={`/classes`} className={`
                      flex-start hover:cursor-pointer hover:text-foreground text-sm
            ${pathname === 'classes' || pathname === 'classroom' ? 'text-foreground' : 'text-muted-foreground'} 
                    `}>
                <GraduationCap size={23} className='mr-2' />Classes
            </Link>

            <Link href={`/prompt-library`} className={`
                       ml-3 flex-start hover:cursor-pointer hover:text-foreground text-sm
            ${pathname.includes("prompt") ? 'text-foreground' : 'text-muted-foreground'}  
                    `}>
                <PenTool size={20} className='mr-2' />My Jots
            </Link>
        </>
    )
}

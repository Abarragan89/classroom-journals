'use client'
import { GraduationCap, PenTool } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation';

export default function TeacherNavLinks() {
    const pathname = usePathname().split('/')[1];
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

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
                    flex-center hover:cursor-pointer leading-loose hover:text-accent mb-1
                    ${pathname === 'classes' || pathname === 'classroom' ? 'border-b' : ''}    
                    `}>
                <GraduationCap size={23} className='mr-2' />Classes
            </Link>

            <Link href={`/prompt-library`} className={`
                    flex-center hover:cursor-pointer leading-loose hover:text-accent
                    ${pathname.includes('prompt') ? 'border-b' : ''}  
                    `}>
                <PenTool size={23} className='mr-2' />My Jots
            </Link>
        </>
    )
}

'use client'
import { ClipboardPen, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation';


export default function StudentNavLinks() {
    const pathname = usePathname().split('/')[1];
    return (
        <>

            <Link href={`/student-dashboard`} className={`
            flex-center hover:cursor-pointer hover:text-primary
            ${pathname === 'student-dashboard' ? 'text-primary underline' : 'text-ring'}  
            `}>
                <LayoutDashboard size={16} className='mr-1' />Dashboard
            </Link>

            <Link href={`/my-work`} className={`
                flex-center hover:cursor-pointer hover:text-primary
                ${pathname === 'my-work' ? 'text-primary underline' : 'text-ring'}    
                `}>
                <ClipboardPen size={16} className='mr-1' />My Work
            </Link>
        </>
    )
}

'use client'
import { GraduationCap, PenTool } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation';


export default function NavLinks() {
    const pathname = usePathname().split('/')[1];
    return (
        <>
            <Link href={`/classes`} className={`
            flex-center hover:cursor-pointer hover:text-primary
            ${pathname === 'classes' || pathname === 'classroom' ? 'text-primary underline' : 'text-ring'}    
            `}>
                <GraduationCap size={21} className='mr-1' />Classes
            </Link>

            <Link href={`/jot-library`} className={`
            flex-center hover:cursor-pointer hover:text-primary
            ${pathname === 'jot-library' ? 'text-primary underline' : 'text-ring'}  
            `}>
                <PenTool size={16} className='mr-1' />Jots
            </Link>
        </>
    )
}

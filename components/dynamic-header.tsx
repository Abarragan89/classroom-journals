"use client";

import { usePathname } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export default function DynamicHeader({ classId, teacherId }: { classId: string; teacherId: string }) {
    const pathname = usePathname();
    const params = useParams();
    let breadCrumbRoute = '/classes';
    let breadCrumbText = 'Back to All Classes';

    if (pathname.includes("single-response")) {
        const promptSessionId = params?.sessionId
        breadCrumbRoute = `/classroom/${classId}/${teacherId}/single-prompt-session/${promptSessionId}`;
        breadCrumbText = 'Back to Class Responses';

    } else if (pathname.includes('single-prompt-session')) {
        breadCrumbRoute = `/classroom/${classId}/${teacherId}`;
        breadCrumbText = 'Back to All Assignments';

    } else if (pathname.includes('roster')) {
        const studentId = params?.studentId
        if (studentId) {
            breadCrumbRoute = `/classroom/${classId}/${teacherId}/roster`;
            breadCrumbText = 'Back to Class Roster';
        }
    }

    return (
        <Link href={breadCrumbRoute} className="flex items-center hover:underline w-fit">
            <ArrowLeftIcon className="mr-1" size={20} />
            {breadCrumbText}
        </Link>
    );
}

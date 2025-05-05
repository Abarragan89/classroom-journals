import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { Response, Session } from "@/types";
import { notFound } from "next/navigation";
import { getSingleStudentResponses } from "@/lib/actions/response.action";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import MyWorkClientWrapper from "./my-work-client-wrapper";


export default async function MyWork() {

    // Get Session Data
    const session = await auth() as Session
    if (!session) notFound()
    const classroomId = session?.classroomId
    if (!classroomId) notFound()


    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'STUDENT' || !studentId) {
        notFound()
    }

    const studentResponses = await getSingleStudentResponses(studentId) as unknown as Response[]

    return (
        <>
            <Header session={session} studentId={studentId} />
            <main className="wrapper">
                <Link href='/student-dashboard' className="flex items-center hover:underline w-fit print:hidden">
                    <ArrowLeftIcon className="mr-1" size={20} />
                    Back to Dashboard
                </Link>
                <h1 className="h1-bold mt-2 line-clamp-1">My Work</h1>
                <div className="mt-5 space-y-5">

                <MyWorkClientWrapper 
                    studentResponses={studentResponses}
                    studentId={studentId}

                />
                </div>
            </main>
        </>
    )
}
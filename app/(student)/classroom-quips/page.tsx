import { auth } from "@/auth"
import Header from "@/components/shared/header"
import { getAllQuips } from "@/lib/server/quips"
import { PromptSession, Session } from "@/types"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import QuipListSection from "@/components/shared/quip-list-section"
import { clearAllQuipAlerts } from "@/lib/actions/alert.action"


export default async function ClassroomQuips() {

    // Get Session Data
    const session = await auth() as Session
    if (!session) return notFound()
    const classroomId = session?.classroomId
    if (!classroomId) return notFound()


    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'STUDENT' || !studentId) {
        return notFound()
    }

    const allQuips = await getAllQuips(classroomId, studentId) as unknown as PromptSession[]

    // clear all alerts when user gets to this page
    await clearAllQuipAlerts(studentId)

    return (
        <>
            <Header session={session} studentId={studentId} />
            <main className="wrapper">
                <Link href='/student-dashboard' className="flex items-center hover:underline w-fit print:hidden">
                    <ArrowLeftIcon className="mr-1" size={20} />
                    Back to Dashboard
                </Link>
                <h1 className="h1-bold mt-2 line-clamp-1">Class Quips</h1>
                <div className="mt-5">
                    <QuipListSection
                        allQuips={allQuips}
                        userId={studentId}
                        role={session?.user?.role}
                        classId={classroomId}
                    />
                </div>
            </main>
        </>
    )
}

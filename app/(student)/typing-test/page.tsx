import { auth } from "@/auth";
import Header from "@/components/shared/header";
import TypingTest from "@/components/shared/typing-test";
import { getUserWPM, getWPMClassHighScores } from "@/lib/actions/wpm.action";
import { Session, User } from "@/types";
import { notFound } from "next/navigation";

export default async function StudentNotifications() {

    const session = await auth() as Session

    if (!session) return notFound()

    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'STUDENT' || !studentId) {
        return notFound()
    }

    const classId = session?.classroomId
    if (!classId) return notFound()

    const studentHighScore = await getUserWPM(studentId) as number
    const classTopTypers = await getWPMClassHighScores(classId, studentId) as User[]

    return (
        <>
            <Header session={session} studentId={studentId} />
            <main className="wrapper">
                <h1 className="h2-bold mt-2 line-clamp-1">Typing Test</h1>
                <TypingTest
                    classId={classId}
                    studentId={studentId}
                    classHighScores={classTopTypers}
                    userHighScore={studentHighScore}
                />
            </main>
        </>
    )
}

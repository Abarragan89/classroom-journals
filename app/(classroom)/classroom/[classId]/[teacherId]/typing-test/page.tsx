import TypingTest from "@/components/shared/typing-test";
import { getUserWPM, getWPMClassHighScores } from "@/lib/actions/wpm.action";
import { User } from "@/types";
import { notFound } from "next/navigation";

export default async function TypingTestPage({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {

    const { teacherId, classId } = await params;
    if (!teacherId || !classId) return notFound()

    const studentHighScore = await getUserWPM(teacherId) as number
    const classTopTypers = await getWPMClassHighScores(classId) as User[]

    return (
        <>
            <main className="wrapper">
                <h1 className="h2-bold mt-2 line-clamp-1">Typing Test</h1>
                <TypingTest
                    classId={classId}
                    studentId={teacherId}
                    classHighScores={classTopTypers}
                    userHighScore={studentHighScore}
                />
            </main>
        </>
    )
}

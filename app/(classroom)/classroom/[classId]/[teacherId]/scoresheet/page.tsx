// import { getAllSessionForScoresheet } from "@/lib/actions/prompt.session.actions"


export default async function ScoreSheet({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {

    const { classId } = await params
    console.log(classId)

    // const classroomScores = await getAllSessionForScoresheet(classId)

    // console.log('classroomscores ', classroomScores)

    return (
        <main>
            {/* {classroomScores?.users.map(({ user }) => (
                <div key={user.id} className="student-card">
                    <h2>{user.name}</h2>
                    <ul>
                        {user.responses.map((res) => (
                            <li key={res.id}>
                                <strong>{res.promptSession.title}</strong> – Score: {res.score ?? 'N/A'} – Status: {res.status}
                            </li>
                        ))}
                    </ul>
                </div>
            ))} */}
            <p>...</p>
        </main>
    )
}

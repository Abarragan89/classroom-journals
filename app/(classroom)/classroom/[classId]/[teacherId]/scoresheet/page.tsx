

export default function ScoreSheet({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {

    console.log('para ', params)
    return (
        <div>ScoreSheet</div>
    )
}

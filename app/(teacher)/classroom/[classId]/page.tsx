export default async function Classroom({ params }: { params: Promise<{ classId: string }> }) {
    console.log('params ', params)
    return (
        <div>Assignments</div>
    )
}

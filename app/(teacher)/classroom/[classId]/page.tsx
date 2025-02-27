
export default async function Classroom({ params }: { params: Promise<{ classId: string }> }) {

    const classroomId = (await params).classId

    // Look up class

    // make sure it belongs to the teacher

    return (
        <div>CLassroom</div>
    )
}

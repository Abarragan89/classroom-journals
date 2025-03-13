
export default async function StudentDashboard({
    params
}: {
    params: Promise<{ studentId: string }>
}) {

    const {studentId} = await params; 

    
    return (
        <div>{studentId}</div>
    )
}

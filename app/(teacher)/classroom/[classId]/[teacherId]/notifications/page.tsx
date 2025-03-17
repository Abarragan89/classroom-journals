

export default async function Notifications({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {
    console.log(params)
    return (
        <div>
            <h2 className="text-2xl lg:text-3xl mt-2">Notifications</h2>
        </div>
    )
}


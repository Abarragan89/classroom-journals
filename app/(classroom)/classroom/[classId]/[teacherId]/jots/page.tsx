import PromptLibrary from "@/components/shared/jot-library-server-comp"

export default async function Jots({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {
    const { teacherId } = await params

    return (
        <PromptLibrary
            teacherId={teacherId}
            inClassroom={true}
        />
    )
}

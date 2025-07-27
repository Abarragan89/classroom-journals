import MyRubricSection from "@/components/shared/my-rubrics-section"

export default async function Jots({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {
    const { teacherId } = await params
    console.log('teacehrid', teacherId)

    return (
        <MyRubricSection
            teacherId={teacherId}
        />
    )
}
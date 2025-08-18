import MyRubricSection from "@/components/shared/my-rubrics-section"
import { getRubricsByTeacherId } from "@/lib/server/rubrics";
import { Rubric } from "@/types"

export default async function Jots({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {
    const { teacherId } = await params

    const teacherRubrics = await getRubricsByTeacherId(teacherId) as unknown as Rubric[]


    return (
        <MyRubricSection
            teacherId={teacherId}
            teacherRubrics={teacherRubrics}
        />
    )
}
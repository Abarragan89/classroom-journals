import CreateEditRubric from "@/components/shared/my-rubrics-section/create-edit-rubric"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Rubric } from "@/types"
import { getRubricById } from "@/lib/server/rubrics"


export default async function EditRubricPage({
    params,
}: {
    params: Promise<{ classId: string, teacherId: string, rubricId: string }>
}) {
    const session = await auth()
    const { classId, rubricId } = await params

    if (!session?.user?.id) {
        redirect("/sign-in")
    }

    const currentRubric = await getRubricById(rubricId) as Rubric

    return (
        <div className="container mx-auto py-6">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6">Edit Rubric</h2>
            <CreateEditRubric
                teacherId={session.user.id}
                currentRubric={currentRubric}
                classId={classId}
            />
        </div>
    )
}

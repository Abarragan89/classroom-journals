import CreateEditRubric from "@/components/shared/my-rubrics-section/create-edit-rubric"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function NewRubricPage({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {
    const session = await auth()
    const { classId } = await params

    if (!session?.user?.id) {
        redirect("/sign-in")
    }

    return (
        <div className="container mx-auto py-6">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6">Create New Rubric</h2>
            <CreateEditRubric
                teacherId={session.user.id}
                currentRubric={null}
                classId={classId}
            />
        </div>
    )
}

import MyRubricList from "@/components/shared/my-rubrics-section/my-rubric-list"
import { getRubricListByTeacherId } from "@/lib/server/rubrics";
import { Rubric } from "@/types"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default async function MyRubricsPage({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {
    const { classId, teacherId } = await params

    const teacherRubrics = await getRubricListByTeacherId(teacherId) as unknown as Rubric[]

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold">My Rubrics</h2>
                <Link href={`/classroom/${classId}/${teacherId}/my-rubrics/new`}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Rubric
                    </Button>
                </Link>
            </div>

            <MyRubricList teacherRubrics={teacherRubrics} classId={classId} teacherId={teacherId} />
        </div>
    )
}
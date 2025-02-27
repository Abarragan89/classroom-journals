import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AddClassModal from "@/components/forms/add-class-form";
import { getAllClassrooms } from "@/lib/actions/classroom.actions";
import ClassCard from "@/components/shared/class-card";
import { Class } from "@/types";

export default async function Dashboard() {
    const session = await auth()

    if (!session) {
        redirect('/')
    }

    const teacherId = session?.user?.id as string
    if (!teacherId) redirect('/')

    const allClassrooms = await getAllClassrooms(teacherId) as Class[]

    return (
        <>
            <AddClassModal teacherId={teacherId} />

            <div className="mt-10 flex flex-wrap justify-center items-end gap-14 mx-auto">
                {allClassrooms && allClassrooms.map((classroom: Class) => (
                    <ClassCard
                        key={classroom.id}
                        teacherId={teacherId}
                        classData={classroom}
                    />

                ))}
            </div>
        </>
    )
}
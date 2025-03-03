import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { getAllClassrooms } from "@/lib/actions/classroom.actions";
import ClassCard from "@/components/shared/class-card";
import { Class } from "@/types";
import Header from "@/components/shared/header";

export default async function Classes() {
    const session = await auth()

    if (!session) notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId) notFound()

    const allClassrooms = await getAllClassrooms(teacherId) as Class[]

    return (
        <>
            <Header teacherId={teacherId} />
            <main className="mt-10 flex flex-wrap justify-center items-end gap-14 mx-auto wrapper">
                {allClassrooms && allClassrooms.map((classroom: Class) => (
                    <ClassCard
                        key={classroom.id}
                        classData={classroom}
                    />

                ))}
            </main>
        </>
    )
}
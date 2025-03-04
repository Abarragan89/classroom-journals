import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { getAllClassrooms } from "@/lib/actions/classroom.actions";
import ClassCard from "@/components/shared/class-card";
import { Class } from "@/types";
import Header from "@/components/shared/header";
import { Plus } from "lucide-react";

export default async function Classes() {
    const session = await auth()

    if (!session) notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId) notFound()

    const allClassrooms = await getAllClassrooms(teacherId) as Class[]

    return (
        <>
            <Header teacherId={teacherId} />
            <main className=" wrapper">
                <h1 className="h1-bold">My Classes</h1>
                <p></p>
                <div className="mt-10 flex flex-wrap justify-center items-end gap-14 mx-auto">
                    {allClassrooms?.length > 0 ? allClassrooms.map((classroom: Class) => (
                        <ClassCard
                            key={classroom.id}
                            classData={classroom}
                        />
                    )) :
                        (
                            <div className="flex flex-col items-center justify-center">
                                <p className="mb-2">No classes</p>
                                <p>Click the <Plus size={18} className="inline" /> to add a class</p>
                            </div>
                        )
                    }
                </div>
            </main>
        </>
    )
}
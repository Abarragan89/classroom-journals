import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { getAllClassrooms } from "@/lib/actions/classroom.actions";
import ClassCard from "@/components/shared/class-card";
import { Class, Session } from "@/types";
import Header from "@/components/shared/header";
import AddClassBtn from "@/components/forms/class-forms/add-class-btn";

export default async function Classes() {

    const session = await auth() as Session

    if (!session) notFound()

    const teacherId = session?.user?.id as string

    if (!teacherId || session?.user?.role !== 'teacher') notFound()

    const allClassrooms = await getAllClassrooms(teacherId) as Class[]

    return (
        <>
            <Header teacherId={teacherId} session={session as Session} />
            <main className=" wrapper">
                <h1 className="h1-bold">My Classes</h1>
                <div className="mt-10 flex flex-wrap items-start gap-14 mx-auto">
                    {allClassrooms?.length > 0 ? allClassrooms.map((classroom: Class) => (
                        <ClassCard
                            key={classroom.id}
                            teacherId={teacherId}
                            classData={classroom}
                        />
                    )) :
                        (
                            <div className="flex flex-col items-center justify-center text-primary">
                                <p className="mb-4 font-bold">No classes</p>
                                <AddClassBtn variant='default' teacherId={teacherId} closeSubMenu={undefined} session={session as Session} />
                            </div>
                        )
                    }
                </div>
            </main>
        </>
    )
}
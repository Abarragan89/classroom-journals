import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Header from "@/components/shared/header";
import { getAllTeacherPrompts } from "@/lib/actions/prompt.actions";
import { Prompt } from "@/types";
import JotSearchArea from "@/components/jot-search-area";
import { getAllClassroomIds } from "@/lib/actions/classroom.actions";
import { ClassroomIds } from "@/types";

export default async function PromptLibrary() {
    const session = await auth()

    if (!session) notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId) notFound()

    const allPrompts = await getAllTeacherPrompts(teacherId) as unknown as Prompt[]
    let allClassroomIds = await getAllClassroomIds(teacherId) as ClassroomIds[]
    // Add default value to beginning fo drop down
    allClassroomIds = [{ id: '', name: 'All Classes' }, ...allClassroomIds]

    return (
        <>
            <Header teacherId={teacherId} />
            <main className="wrapper mx-auto">
                <h1 className="h1-bold">My Jots</h1>
                <JotSearchArea
                    initialPrompts={allPrompts}
                    classroomData={allClassroomIds}
                />
            </main>
        </>
    )
}
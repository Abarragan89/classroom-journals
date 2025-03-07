import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Header from "@/components/shared/header";
import { getAllTeacherPrompts } from "@/lib/actions/prompt.actions";
import { Prompt, Session } from "@/types";
import JotSearchArea from "@/components/jot-search-area";
import { getAllClassroomIds } from "@/lib/actions/classroom.actions";
import { Classroom } from "@/types";
import CreateNewJot from "@/components/modalBtns/create-new-jot";

export default async function PromptLibrary() {
    const session = await auth()

    if (!session) notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId) notFound()

    const allPrompts = await getAllTeacherPrompts(teacherId) as unknown as Prompt[]
    let allClassroomIds = await getAllClassroomIds(teacherId) as Classroom[]
    // Add default value to beginning fo drop down for searchbar
    allClassroomIds = [{ id: '', name: 'All Classes' }, ...allClassroomIds]


    return (
        <>
            <Header teacherId={teacherId} session={session as Session}/>
            <main className="wrapper mx-auto relative">
                <div className="flex-between">
                    <h1 className="h1-bold">My Jots</h1>
                    <CreateNewJot />
                </div>
                <JotSearchArea
                    initialPrompts={allPrompts}
                    classroomData={allClassroomIds}
                    teacherId={teacherId}
                />
            </main>
        </>
    )
}
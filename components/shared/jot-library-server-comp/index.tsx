import { getAllTeacherPrompts } from "@/lib/actions/prompt.actions";
import { Prompt, PromptCategory } from "@/types";
import JotSearchArea from "@/components/jot-search-area";
import { getAllClassroomIds } from "@/lib/actions/classroom.actions";
import { Classroom } from "@/types";
import CreateNewJot from "@/components/modalBtns/create-new-jot";
import { getAllPromptCategories } from "@/lib/actions/prompt.categories";

export default async function PromptLibrary({
    teacherId,
    inClassroom
}: {
    teacherId: string,
    inClassroom?: boolean
}) {

    const allPrompts = await getAllTeacherPrompts(teacherId) as unknown as Prompt[]
    let allClassroomIds = await getAllClassroomIds(teacherId) as Classroom[]
    let allPromptCategories = await getAllPromptCategories(teacherId) as PromptCategory[]
    // Add default value to beginning fo drop down for searchbar
    allPromptCategories = [{ id: '', name: 'All Categories...' }, ...allPromptCategories]

    return (
        <>
            <main className={`${inClassroom ? '' : 'wrapper'} mx-auto relative`}>
                <div className="flex-between">
                    <h1 className={`${inClassroom ? 'text-2xl lg:text-3xl mt-2' : 'h1-bold'}`}>Jot Library</h1>
                    <CreateNewJot />
                </div>
                <JotSearchArea
                    initialPrompts={allPrompts}
                    classroomData={allClassroomIds}
                    categories={allPromptCategories}
                />
            </main>
        </>
    )
}
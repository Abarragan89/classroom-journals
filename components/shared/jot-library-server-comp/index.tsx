import { getAllTeacherPrompts } from "@/lib/actions/prompt.actions";
import { Prompt, PromptCategory } from "@/types";
import JotSearchArea from "@/components/jot-search-area";
import { getAllClassroomIds } from "@/lib/actions/classroom.actions";
import { Classroom } from "@/types";
import CreateNewJot from "@/components/modalBtns/create-new-jot";
import { getAllPromptCategories } from "@/lib/actions/prompt.categories";

export default async function PromptLibrary({
    teacherId,
    inClassroom,
}: {
    teacherId: string,
    inClassroom?: boolean,
}) {

    const allPrompts = await getAllTeacherPrompts(teacherId) as unknown as { prompts: Prompt[], totalCount: number }
    const allClassroomIds = await getAllClassroomIds(teacherId) as Classroom[]
    let allPromptCategories = await getAllPromptCategories(teacherId) as PromptCategory[]
    // Add default value to beginning fo drop down for searchbar
    allPromptCategories = [{ id: '', name: 'All Categories...' }, ...allPromptCategories]

    return (
        <>
            <main className={`${inClassroom ? '' : 'wrapper'} mx-auto relative`}>
                <div className="flex-between relative">
                    <h1 className={`${inClassroom ? 'text-2xl lg:text-3xl mt-2' : 'h1-bold'}`}>Jot Library</h1>
                    <div className="absolute top-[40px] right-0">
                        <CreateNewJot 
                        />
                    </div>
                </div>
                <JotSearchArea
                    initialPrompts={allPrompts.prompts}
                    classroomData={allClassroomIds}
                    categories={allPromptCategories}
                    totalPromptCount={allPrompts.totalCount}
                    teacherId={teacherId}
                />
            </main>
        </>
    )
}
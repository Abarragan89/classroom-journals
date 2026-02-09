import { getAllTeacherPrompts } from "@/lib/server/prompts";
import { Prompt, PromptCategory } from "@/types";
import JotSearchArea from "@/components/jot-search-area";
import { getAllClassroomIds } from "@/lib/server/classroom";
import { Classroom } from "@/types";
import { getAllPromptCategories } from "@/lib/server/student-dashboard";

export default async function PromptLibrary({
    teacherId,
    inClassroom,
}: {
    teacherId: string,
    inClassroom?: boolean,
}) {

    const [allPrompts, allClassroomIds, allPromptCategories] = await Promise.all([
        getAllTeacherPrompts(teacherId) as unknown as { prompts: Prompt[], totalCount: number },
        getAllClassroomIds(teacherId) as unknown as Classroom[],
        getAllPromptCategories(teacherId) as unknown as PromptCategory[]
    ]);

    // Add default value to beginning fo drop down for searchbar
    const allPromptCategoriesWithSpacer = [{ id: '', name: 'All Categories...' }, ...allPromptCategories]

    return (
        <>
            <main className={`${inClassroom ? '' : 'wrapper'} mx-auto relative`}>
                <div className="flex-between relative">
                    <h1 className={`${inClassroom ? 'text-2xl lg:text-3xl mt-2' : 'h1-bold'}`}>Jot Library</h1>
                </div>
                <JotSearchArea
                    initialPrompts={allPrompts.prompts}
                    classroomData={allClassroomIds}
                    categories={allPromptCategoriesWithSpacer}
                    totalPromptCount={allPrompts.totalCount}
                    teacherId={teacherId}
                />
            </main>
        </>
    )
}
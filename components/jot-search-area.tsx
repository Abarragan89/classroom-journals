'use client'
import { Prompt } from "@/types"
import { useState, useRef } from "react"
import PromptFilterOptions from "./shared/prompt-filter-options"
import PromptCard from "./shared/prompt-card"
import { SearchOptions } from "@/types"
import { getFilterPrompts } from "@/lib/actions/prompt.actions"
import { Classroom } from "@/types"

export default function JotSearchArea({
    initialPrompts,
    classroomData,
    teacherId
}: {
    initialPrompts: Prompt[],
    classroomData: Classroom[],
    teacherId: string
}) {

    const [fetchedPrompts, setFetchedPrompts] = useState<Prompt[]>(initialPrompts)
    // Make the following into one state object
    const promptSearchOptions = useRef<SearchOptions>({
        classroom: '',
        filter: '',
        paginationSkip: 0,
        searchWords: ''
    });

    async function getFilteredSearch(filterOptions: SearchOptions) {
        const filterPrompts = await getFilterPrompts(filterOptions) as unknown as Prompt[]
        setFetchedPrompts(filterPrompts)
    }

    return (
        <>
            <PromptFilterOptions
                searchOptionsRef={promptSearchOptions}
                getFilteredSearch={getFilteredSearch}
                classroomData={classroomData}
            />
            <div className="mt-10 flex flex-wrap items-start  gap-x-5 mb-10">
                {/* Insert all the prompt jot cards here */}
                {fetchedPrompts?.length > 0 && fetchedPrompts.map((prompt: Prompt) => (
                    <PromptCard
                        key={prompt.id}
                        promptData={prompt}
                        teacherId={teacherId}
                        updatePromptData={setFetchedPrompts}
                        classroomData={classroomData}
                    />
                ))}
            </div>
        </>
    )
}

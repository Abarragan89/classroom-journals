'use client'
import { Prompt } from "@/types"
import { useState, useRef } from "react"
import PromptFilterOptions from "./shared/prompt-filter-options"
import PromptCard from "./shared/prompt-card"
import { SearchOptions } from "@/types"
import { getFilterPrompts } from "@/lib/actions/prompt.actions"
import { ClassroomIds } from "@/types"

export default function JotSearchArea({
    initialPrompts,
    classroomData
}: {
    initialPrompts: Prompt[],
    classroomData: ClassroomIds[]
}) {

    const [fetchedPrompts, setFetchedPrompts] = useState(initialPrompts)
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
            <div className="mt-10 flex justify-around items-start flex-wrap gap-x-10 mb-10">
                {/* Insert all the prompt jot cards here */}
                {fetchedPrompts?.length > 0 && fetchedPrompts.map((prompt: Prompt) => (
                    <PromptCard key={prompt.id} promptData={prompt} />
                ))}
            </div>
        </>
    )
}

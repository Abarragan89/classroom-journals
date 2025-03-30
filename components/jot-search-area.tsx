'use client'
import { Prompt, PromptCategory } from "@/types"
import { useState, useRef } from "react"
import PromptFilterOptions from "./shared/prompt-filter-options"
import PromptCard from "./shared/prompt-card"
import { SearchOptions } from "@/types"
import { getFilterPrompts } from "@/lib/actions/prompt.actions"
import { Classroom } from "@/types"

export default function JotSearchArea({
    initialPrompts,
    classroomData,
    categories,
}: {
    initialPrompts: Prompt[],
    classroomData: Classroom[],
    categories: PromptCategory[]
}) {

    const [fetchedPrompts, setFetchedPrompts] = useState<Prompt[]>(initialPrompts)
    // Make the following into one state object
    const promptSearchOptions = useRef<SearchOptions>({
        category: '',
        filter: '',
        paginationSkip: 0,
        searchWords: ''
    });

    async function getFilteredSearch(filterOptions: SearchOptions) {
        const filterPrompts = await getFilterPrompts(filterOptions) as unknown as Prompt[]
        setFetchedPrompts(filterPrompts)
    }

    return (
        <div className="mt-16">
            <PromptFilterOptions
                searchOptionsRef={promptSearchOptions}
                getFilteredSearch={getFilteredSearch}
                categories={categories}
            />
            <div className="mt-10 flex flex-wrap items-start gap-10 mb-10">
                {/* Insert all the prompt jot cards here */}
                {fetchedPrompts?.length > 0 && fetchedPrompts.map((prompt: Prompt) => (
                    <PromptCard
                        key={prompt.id}
                        promptData={prompt}
                        updatePromptData={setFetchedPrompts}
                        classroomData={classroomData}
                    />
                ))}
            </div>
        </div>
    )
}

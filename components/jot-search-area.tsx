'use client'
import { Prompt, PromptCategory } from "@/types"
import { useState, useRef } from "react"
import PromptFilterOptions from "./shared/prompt-filter-options"
import PromptCard from "./shared/prompt-card"
import { SearchOptions } from "@/types"
import { getFilterPrompts } from "@/lib/actions/prompt.actions"
import { Classroom } from "@/types"
import PaginationList from "./shared/prompt-filter-options/pagination-list"

export default function JotSearchArea({
    initialPrompts,
    classroomData,
    categories,
    totalPromptCount,
    teacherId,
}: {
    initialPrompts: Prompt[],
    classroomData: Classroom[],
    categories: PromptCategory[],
    totalPromptCount: number,
    teacherId: string
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
            {/* Insert all the prompt jot cards here */}
            {fetchedPrompts?.length > 0 ? (
                <div className="mt-10 flex flex-wrap items-start gap-10 mb-10">
                    {fetchedPrompts.map((prompt: Prompt) => (
                        <PromptCard
                            key={prompt.id}
                            promptData={prompt}
                            updatePromptData={setFetchedPrompts}
                            classroomData={classroomData}
                            teacherId={teacherId}
                        />
                    ))}
                    <PaginationList
                        searchOptionsRef={promptSearchOptions}
                        getFilteredSearch={getFilteredSearch}
                        totalItems={totalPromptCount}
                        itemsPerPage={20}
                    />
                </div>
            ) : (
                <p className="text-center italic text-2xl mt-10">No Jots in your Library</p>
            )}
        </div>
    )
}

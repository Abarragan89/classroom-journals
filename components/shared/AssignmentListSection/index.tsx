'use client'
import { PromptCategory, PromptSession, SearchOptions } from "@/types"
import { useRef, useState } from "react"
import AssignmentListItem from "@/components/shared/AssignmentListSection/assignment-list-item"
import { getFilteredPromptSessions } from "@/lib/actions/prompt.session.actions"
import PromptSearchBar from "../prompt-filter-options/prompt-search-bar"
import TraitFilterCombobox from "../prompt-filter-options/trait-filter-combobox"
import ClassFilterCombobox from "../prompt-filter-options/category-filter-combobox"


interface Props {
    categories: PromptCategory[];
    initialPrompts: PromptSession[];
    studentCount: number;
    classId: string;
    teacherId: string
}
export default function AssignmentListSection({
    categories,
    initialPrompts,
    studentCount,
    classId,
    teacherId,
}: Props) {

    const [fetchedPrompts, setFetchedPrompts] = useState<PromptSession[]>(initialPrompts)

    const promptSearchOptions = useRef<SearchOptions>({
        category: '',
        filter: '',
        paginationSkip: 0,
        searchWords: ''
    });

    async function getFilteredSearch(filterOptions: SearchOptions) {
        const filterPrompts = await getFilteredPromptSessions(filterOptions) as unknown as PromptSession[]
        setFetchedPrompts(filterPrompts)
    }


    return (
        <>
            {fetchedPrompts?.length > 0 ?
                <div className="flex flex-col-reverse items-end lg:flex-row lg:items-start justify-between">
                    <div className="flex-2 w-full lg:mr-10">
                        {fetchedPrompts.map((prompt: PromptSession) => (
                            <AssignmentListItem
                                key={prompt.id}
                                jotData={prompt}
                                classId={classId}
                                teacherId={teacherId}
                                classSize={studentCount}
                            />
                        ))}
                    </div>
                    <div className="flex-1 mb-5 w-full flex flex-wrap md:flex-col lg:flex-col items-stretch lg:min-w-[280px] gap-3">
                        {/* Search Bar (always full width) */}
                        <div className="w-full">
                            <PromptSearchBar
                                searchOptionsRef={promptSearchOptions}
                                getFilteredSearch={getFilteredSearch}
                            />
                        </div>
                        {/* Wrapper for combo boxes */}
                        <div className="flex w-full gap-4 lg:flex-col">
                            <div className="flex-1 w-full">
                                <TraitFilterCombobox
                                    searchOptionsRef={promptSearchOptions}
                                    getFilteredSearch={getFilteredSearch}
                                />
                            </div>
                            <div className="flex-1 w-full">
                                <ClassFilterCombobox
                                    searchOptionsRef={promptSearchOptions}
                                    categories={categories}
                                    getFilteredSearch={getFilteredSearch}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                : (
                    <p>No Assignments posted</p>
                )}
        </>
    )
}

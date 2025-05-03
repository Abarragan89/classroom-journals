'use client'
import { PromptSession, SearchOptions } from "@/types"
import { useRef, useState } from "react"
import { getFilteredPromptSessions } from "@/lib/actions/prompt.session.actions"
import PromptSearchBar from "@/components/shared/prompt-filter-options/prompt-search-bar"
import TraitFilterCombobox from "@/components/shared/prompt-filter-options/trait-filter-combobox"
import PaginationList from "@/components/shared/prompt-filter-options/pagination-list"
import StudentAssignmentListItem from "./student-assignment-list-item"
import { PromptCategory, Response } from "@/types"

interface Props {
    initialPrompts: PromptSession[];
    promptCountTotal: number
    categories: PromptCategory[],
    studentId: string

}
export default function AssignmentSectionClient({
    initialPrompts,
    promptCountTotal,
    categories,
    studentId
}: Props) {

    const [fetchedPrompts, setFetchedPrompts] = useState<PromptSession[]>(initialPrompts)

    const promptSearchOptions = useRef<SearchOptions>({
        category: '',
        status: '',
        filter: '',
        paginationSkip: 0,
        searchWords: ''
    });

    async function getFilteredSearch(filterOptions: SearchOptions) {
        let filterPrompts = await getFilteredPromptSessions(filterOptions) as unknown as PromptSession[];
        const promptSessionWithMetaData = filterPrompts?.map(session => {
            // Determine if assignment is completed
            const isCompleted = session?.responses?.some(response => response.studentId === studentId)
            let studentResponseId: string | null = null
            let isSubmittable: boolean = false;
            if (isCompleted) {
                // if completed, get their responseID so we can navigate them to their '/review-reponse/${responseID}'
                const { id, isSubmittable: isReturned } = session?.responses?.find(res => res.studentId === studentId) as unknown as Response
                studentResponseId = id;
                isSubmittable = isReturned
            }
            // Add fields is completed, and their specific responseID to the promptSession
            return ({
                ...session,
                isCompleted,
                isSubmittable,
                studentResponseId,
            })
        }) as unknown as PromptSession[]
        setFetchedPrompts(promptSessionWithMetaData)
    }

    const traitFilterOptions = [
        {
            value: " ",
            label: "All Assignments",
        },
        {
            value: "multi-question",
            label: "Assessments",
        },
        {
            value: "single-question",
            label: "Blog Prompts",
        }
    ]

    const categoryFilterOptions = categories.map(category => ({
        value: category.id,
        label: category.name
    }))

    categoryFilterOptions.unshift({ value: " ", label: "All Categories" })


    return (
        <>
            < div className="flex flex-col-reverse items-end md:flex-row md:items-start justify-between">
                {fetchedPrompts?.length <= 0 ? (
                    <p className="flex-1">No Assignments</p>
                ) : (
                    <div className="flex-2 w-full md:mr-10">
                        {fetchedPrompts.map((prompt: PromptSession) => (
                            <StudentAssignmentListItem
                                key={prompt.id}
                                jotData={prompt}
                            />
                        ))}
                        <PaginationList
                            searchOptionsRef={promptSearchOptions}
                            getFilteredSearch={getFilteredSearch}
                            totalItems={promptCountTotal}
                            itemsPerPage={30}
                        />
                    </div>
                )}
                <div className="flex-1 sticky top-5 mb-5 w-full flex flex-wrap md:flex-col items-stretch md:min-w-[280px] gap-3">
                    {/* Search Bar (always full width) */}
                    <div className="w-full">
                        <PromptSearchBar
                            searchOptionsRef={promptSearchOptions}
                            getFilteredSearch={getFilteredSearch}
                        />
                    </div>
                    {/* Wrapper for combo boxes */}
                    <div className="flex w-full gap-4 md:flex-col">
                        <div className="flex-1 w-full">
                            <TraitFilterCombobox
                                searchOptionsRef={promptSearchOptions}
                                options={traitFilterOptions}
                                field='filter'
                                getFilteredSearch={getFilteredSearch}
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <TraitFilterCombobox
                                searchOptionsRef={promptSearchOptions}
                                options={categoryFilterOptions}
                                field='category'
                                getFilteredSearch={getFilteredSearch}
                            />
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}

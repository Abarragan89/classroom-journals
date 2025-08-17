'use client'
import { SearchOptions } from "@/types"
import { useEffect, useRef, useState } from "react"
import PromptSearchBar from "@/components/shared/prompt-filter-options/prompt-search-bar"
import TraitFilterCombobox from "@/components/shared/prompt-filter-options/trait-filter-combobox"
import PaginationList from "@/components/shared/prompt-filter-options/pagination-list"
import StudentAssignmentListItem from "./student-assignment-list-item"
import { PromptCategory, Response } from "@/types"

interface Props {
    initialPrompts: Response[];
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

    const [fetchedPrompts, setFetchedPrompts] = useState<Response[]>(initialPrompts)


    const promptSearchOptions = useRef<SearchOptions>({
        category: '',
        status: '',
        filter: '',
        paginationSkip: 0,
        searchWords: ''
    });

    async function getFilteredSearch(filterOptions: SearchOptions) {
        const response = await fetch(`/api/responses/student/${studentId}/filtered`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filterOptions)
        });

        if (!response.ok) {
            throw new Error('Failed to fetch filtered student responses');
        }

        const data = await response.json();
        setFetchedPrompts(data.responses as Response[]);
    }

    useEffect(() => {
        setFetchedPrompts(initialPrompts)
    }, [initialPrompts])

    const traitFilterOptions = [
        {
            value: " ",
            label: "All Assignments",
        },
        {
            value: "ASSESSMENT",
            label: "Assessments",
        },
        {
            value: "BLOG",
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
                    <p className="flex-1 text-center">No Assignments</p>
                ) : (
                    <div className="flex-2 w-full md:mr-10">
                        {fetchedPrompts.map((response: Response) => (
                            <StudentAssignmentListItem
                                key={response.id}
                                studentResponse={response}
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

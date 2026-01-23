'use client'
import { SearchOptions } from "@/types"
import {  useState } from "react"
import PromptSearchBar from "@/components/shared/prompt-filter-options/prompt-search-bar"
import TraitFilterCombobox from "@/components/shared/prompt-filter-options/trait-filter-combobox"
import PaginationList from "@/components/shared/prompt-filter-options/pagination-list"
import StudentAssignmentListItem from "./student-assignment-list-item"
import { PromptCategory, Response } from "@/types"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

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

    // const [fetchedPrompts, setFetchedPrompts] = useState<Response[]>(initialPrompts)


    const [searchOptions, setSearchOptions] = useState<SearchOptions>({
        category: '',
        filter: '',
        paginationSkip: 0,
        searchWords: ''
    });

    const { data: fetchedPrompts } = useQuery({
        queryKey: ['prompts', studentId, searchOptions],
        queryFn: async () => {
            const res = await fetch(`/api/responses/student/${studentId}/filtered`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(searchOptions)
            });
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            return data.responses as Response[];
        },
        placeholderData: keepPreviousData,
        initialData: initialPrompts,
        staleTime: 0,
        refetchOnMount: 'always'
    });

    function handleFilterChange(newOptions: Partial<SearchOptions>) {
        setSearchOptions(prev => ({ ...prev, ...newOptions }));
    }

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
            < div className="flex flex-col-reverse items-center md:flex-row md:items-start justify-between">
                {fetchedPrompts && fetchedPrompts?.length <= 0 ? (
                    <p className="flex-1 text-center font-medium text-xl mt-3">No Assignments Posted</p>
                ) : (
                    <div className="flex-2 w-full md:mr-10">
                        {fetchedPrompts?.map((response: Response) => (
                            <StudentAssignmentListItem
                                key={response.id}
                                studentResponse={response}
                            />
                        ))}
                        <PaginationList
                            searchOptionState={searchOptions}
                            getFilteredSearch={handleFilterChange}
                            totalItems={promptCountTotal}
                            itemsPerPage={30}
                        />
                    </div>
                )}
                <div className="flex-1 sticky top-5 mb-5 w-full flex flex-wrap md:flex-col items-stretch md:min-w-[280px] gap-3">
                    {/* Search Bar (always full width) */}
                    <div className="w-full">
                        <PromptSearchBar
                            searchOptionState={searchOptions}
                            getFilteredSearch={handleFilterChange}
                        />
                    </div>
                    {/* Wrapper for combo boxes */}
                    <div className="flex w-full gap-4 md:flex-col">
                        <div className="flex-1 w-full">
                            <TraitFilterCombobox
                                searchOptionState={searchOptions}
                                options={traitFilterOptions}
                                field='filter'
                                getFilteredSearch={handleFilterChange}
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <TraitFilterCombobox
                                searchOptionState={searchOptions}
                                options={categoryFilterOptions}
                                field='category'
                                getFilteredSearch={handleFilterChange}
                            />
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}

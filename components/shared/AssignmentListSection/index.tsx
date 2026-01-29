'use client'
import { PromptCategory, PromptSession, SearchOptions } from "@/types"
import { useState } from "react"
import AssignmentListItem from "@/components/shared/AssignmentListSection/assignment-list-item"
import PromptSearchBar from "../prompt-filter-options/prompt-search-bar"
import TraitFilterCombobox from "../prompt-filter-options/trait-filter-combobox"
import PaginationList from "../prompt-filter-options/pagination-list"
import { useQuery } from "@tanstack/react-query"

interface Props {
    categories: PromptCategory[];
    initialPrompts: PromptSession[];
    classId: string;
    teacherId: string;
    promptCountTotal: number
}
export default function AssignmentListSection({
    categories,
    initialPrompts,
    classId,
    teacherId,
    promptCountTotal
}: Props) {

    const [searchOptions, setSearchOptions] = useState<SearchOptions>({
        category: '',
        filter: '',
        paginationSkip: 0,
        searchWords: ''
    });

    const { data: fetchedPrompts, error } = useQuery({
        queryKey: ['assignmentListDash', classId, searchOptions],
        queryFn: async () => {
            const queryParams = new URLSearchParams({
                classId: classId,
                teacherId: teacherId,
                category: searchOptions.category || "",
                searchWords: searchOptions.searchWords || "",
                filter: searchOptions.filter || "",
                paginationSkip: searchOptions.paginationSkip.toString()
            });
            const response = await fetch(`/api/prompt-sessions/filtered?${queryParams}`);
            if (response.ok) {
                const { promptSessions } = await response.json();
                return promptSessions;
            } else {
                throw new Error('Failed to fetch filtered prompt sessions');
            }
        },
        initialData: initialPrompts,
        staleTime: 0,
        refetchOnMount: 'always'
    })

    if (error) {
        throw new Error('Error finding assignment list')


    }

    function handleFilterChange(newOptions: Partial<SearchOptions>) {
        setSearchOptions(prev => ({ ...prev, ...newOptions }));
    }

    const traitFilterOptions = [
        {
            value: "desc",
            label: "Newest",
        },
        {
            value: "asc",
            label: "Oldest",
        },
        {
            value: "ASSESSMENT",
            label: "Assessments",
        },
        {
            value: "BLOG",
            label: "Blog Prompts",
        },
    ]

    // convert categories data into consumable combobox data
    const categoryFilterOptions = categories.map(category => ({
        value: category.id,
        label: category.name
    }))

    return (
        <>
            < div className="flex flex-col-reverse items-center lg:flex-row lg:items-start justify-between">
                {fetchedPrompts && fetchedPrompts?.length > 0 ? (
                    <div className="flex-2 w-full lg:mr-10 space-y-5">
                        {fetchedPrompts?.map((prompt: PromptSession) => (
                            <AssignmentListItem
                                key={prompt.id}
                                jotData={prompt}
                                classId={classId}
                                teacherId={teacherId}
                            />
                        ))}
                        <PaginationList
                            searchOptionState={searchOptions}
                            getFilteredSearch={handleFilterChange}
                            totalItems={promptCountTotal}
                            itemsPerPage={30}
                        />
                    </div>
                ) : (
                    <p className="flex-1 text-center font-medium text-xl">No Assignment Posted</p>
                )}
                <div className="flex-1 top-5 mb-5 w-full flex flex-wrap md:flex-col lg:flex-col items-stretch lg:min-w-[280px] gap-3">
                    {/* Search Bar (always full width) */}
                    <div className="w-full">
                        <PromptSearchBar
                            searchOptionState={searchOptions}
                            getFilteredSearch={handleFilterChange}
                        />
                    </div>
                    {/* Wrapper for combo boxes */}
                    <div className="flex w-full gap-4 lg:flex-col">
                        <div className="flex-1 w-full">
                            {/* Trait Combo */}
                            <TraitFilterCombobox
                                searchOptionState={searchOptions}
                                getFilteredSearch={handleFilterChange}
                                options={traitFilterOptions}
                                field={'filter'}
                            />
                        </div>
                        <div className="flex-1 w-full">
                            {/* Category Combo */}
                            <TraitFilterCombobox
                                searchOptionState={searchOptions}
                                getFilteredSearch={handleFilterChange}
                                options={categoryFilterOptions}
                                field={'category'}
                            />
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}

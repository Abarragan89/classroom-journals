'use client'
import { PromptCategory, PromptSession, SearchOptions } from "@/types"
import { useEffect, useRef, useState } from "react"
import AssignmentListItem from "@/components/shared/AssignmentListSection/assignment-list-item"
import PromptSearchBar from "../prompt-filter-options/prompt-search-bar"
import TraitFilterCombobox from "../prompt-filter-options/trait-filter-combobox"
import PaginationList from "../prompt-filter-options/pagination-list"
import { useQuery } from "@tanstack/react-query"

interface Props {
    categories: PromptCategory[];
    initialPrompts: PromptSession[];
    studentCount: number;
    classId: string;
    teacherId: string;
    promptCountTotal: number
}
export default function AssignmentListSection({
    categories,
    initialPrompts,
    studentCount,
    classId,
    teacherId,
    promptCountTotal
}: Props) {


    const { error } = useQuery({
        queryKey: ['assignmentListDash', classId],
        queryFn: async () => {
            const response = await fetch(`/api/prompt-sessions/class?classId=${classId}&teacherId=${teacherId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch class sessions');
            }
            const { sessionData } = await response.json();
            setFetchedPrompts(sessionData?.prompts || []);
            return sessionData.prompts;
        },
        initialData: initialPrompts,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    if (error) {
        throw new Error('Error finding assignment list')
    }

    const [fetchedPrompts, setFetchedPrompts] = useState<PromptSession[]>(initialPrompts)

    const promptSearchOptions = useRef<SearchOptions>({
        category: '',
        filter: '',
        paginationSkip: 0,
        searchWords: ''
    });

    async function getFilteredSearch(filterOptions: SearchOptions) {
        try {
            const queryParams = new URLSearchParams({
                classId: classId,
                teacherId: teacherId,
                category: filterOptions.category || "",
                searchWords: filterOptions.searchWords || "",
                filter: filterOptions.filter || "",
                paginationSkip: filterOptions.paginationSkip.toString()
            });

            const response = await fetch(`/api/prompt-sessions/filtered?${queryParams}`);
            if (response.ok) {
                const { promptSessions } = await response.json();
                setFetchedPrompts(promptSessions as PromptSession[]);
            } else {
                console.error('Failed to fetch filtered prompt sessions:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching filtered prompt sessions:', error);
        }
    }

    useEffect(() => {
        setFetchedPrompts(initialPrompts)
    }, [initialPrompts])

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
                                classSize={studentCount}
                            />
                        ))}
                        <PaginationList
                            searchOptionsRef={promptSearchOptions}
                            getFilteredSearch={getFilteredSearch}
                            totalItems={promptCountTotal}
                            itemsPerPage={30}
                        />
                    </div>
                ) : (
                    <p className="flex-1 text-center font-medium text-xl">No Assignment Posted</p>
                )}
                <div className="flex-1 sticky top-5 mb-5 w-full flex flex-wrap md:flex-col lg:flex-col items-stretch lg:min-w-[280px] gap-3">
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
                            {/* Trait Combo */}
                            <TraitFilterCombobox
                                searchOptionsRef={promptSearchOptions}
                                getFilteredSearch={getFilteredSearch}
                                options={traitFilterOptions}
                                field={'filter'}
                            />
                        </div>
                        <div className="flex-1 w-full">
                            {/* Category Combo */}
                            <TraitFilterCombobox
                                searchOptionsRef={promptSearchOptions}
                                getFilteredSearch={getFilteredSearch}
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

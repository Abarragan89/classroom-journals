'use client'
import { PromptCategory, PromptSession, SearchOptions } from "@/types"
import { useEffect, useRef, useState } from "react"
import AssignmentListItem from "@/components/shared/AssignmentListSection/assignment-list-item"
import { getAllSessionsInClass, getFilteredPromptSessions } from "@/lib/actions/prompt.session.actions"
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
            const classdata = await getAllSessionsInClass(classId, teacherId) as unknown as { prompts: PromptSession[], totalCount: number }
            setFetchedPrompts(classdata?.prompts || [])
            return classdata.prompts
        },
        initialData: initialPrompts,
        // refetchOnMount: false,
        refetchOnReconnect: false,
        // refetchOnWindowFocus: false,
        // staleTime: Infinity,
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
        const filterPrompts = await getFilteredPromptSessions(filterOptions, classId, teacherId) as unknown as PromptSession[]
        setFetchedPrompts(filterPrompts)
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
            < div className="flex flex-col-reverse items-end lg:flex-row lg:items-start justify-between">
                {fetchedPrompts && fetchedPrompts?.length > 0 ? (
                    <div className="flex-2 w-full lg:mr-10">
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
                    <p className="flex-1 text-center">No Assignments</p>
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

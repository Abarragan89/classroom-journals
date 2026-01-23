'use client'
import { Prompt, PromptCategory } from "@/types"
import { useState } from "react"
import PromptFilterOptions from "./shared/prompt-filter-options"
import PromptCard from "./shared/prompt-card"
import { SearchOptions } from "@/types"
import { Classroom } from "@/types"
import PaginationList from "./shared/prompt-filter-options/pagination-list"
import CreateNewJot from "./modalBtns/create-new-jot"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import LoadingAnimation from "./loading-animation"

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

    const [searchOptions, setSearchOptions] = useState<SearchOptions>({
        category: '',
        filter: '',
        paginationSkip: 0,
        searchWords: ''
    });

    const [isThereAtLeastOneJot, setIsThereAtLeastOneJot] = useState<boolean>(initialPrompts.length > 0);

    const { data: fetchedPrompts, isFetching } = useQuery({
        queryKey: ['prompts', teacherId, searchOptions],
        queryFn: async () => {
            const queryParams = new URLSearchParams({
                teacherId,
                category: searchOptions.category || "",
                searchWords: searchOptions.searchWords || "",
                filter: searchOptions.filter || "",
                paginationSkip: searchOptions.paginationSkip.toString(),
            });

            const res = await fetch(`/api/prompts/filtered?${queryParams}`);
            if (!res.ok) throw new Error("Failed to fetch");
            return (await res.json()).prompts as Prompt[];
        },
        placeholderData: keepPreviousData,
        staleTime: 0,
    });

    function handleFilterChange(newOptions: Partial<SearchOptions>) {
        setSearchOptions(prev => ({ ...prev, ...newOptions }));
    }

    return (
        <div className="mt-16">
            <PromptFilterOptions
                searchOptionState={searchOptions}
                getFilteredSearch={handleFilterChange}
                categories={categories}
            />

            {/* Insert all the prompt jot cards here */}
            {fetchedPrompts && fetchedPrompts.length > 0 ? (
                <div className="mt-10 mb-10 ">
                    <div className="mb-8 grid-cols-1 xl:grid-cols-2 grid gap-6 items-start">
                        {fetchedPrompts.map((prompt: Prompt) => (
                            <PromptCard
                                key={prompt.id}
                                promptData={prompt}
                                classroomData={classroomData}
                                teacherId={teacherId}
                            />
                        ))}
                    </div>
                    <PaginationList
                        searchOptionState={searchOptions}
                        getFilteredSearch={handleFilterChange}
                        totalItems={totalPromptCount}
                        itemsPerPage={20}
                    />
                </div>
            ) : (
                isFetching ? (
                    <div className="flex flex-col justify-center items-center mt-16">
                        <h3 className="h3-bold mt-10">Loading Jots...</h3>
                        <LoadingAnimation />
                    </div>
                ) : (
                    // Only show this when there are no jots at all
                    !isThereAtLeastOneJot && (
                        <>
                            <p className="text-center font-bold text-muted-foreground text-2xl mt-10">No Jots in your Library</p>
                            <Card className="mt-5 w-fit mx-auto ">
                                <CardHeader className="pb-0">
                                    <CardTitle className="text-center text-2xl text-primary">What&apos;s a Jot?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-center text-muted-foreground max-w-sm">Jots are writing prompts (i.e. blogs) or assessments that you can assign to your classes.</p>
                                    <div className="flex-center mt-5">
                                        <CreateNewJot />
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )
                )
            )
            }
        </div >
    )
}

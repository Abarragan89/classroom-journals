'use client'
import { Prompt, PromptCategory } from "@/types"
import { useState } from "react"
import PromptFilterOptions from "./shared/prompt-filter-options"
import PromptCard from "./shared/prompt-card"
import { SearchOptions } from "@/types"
import { Classroom } from "@/types"
import PaginationList from "./shared/prompt-filter-options/pagination-list"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import LoadingAnimation from "./loading-animation"
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
import CreateNewJot from "./modalBtns/create-new-jot"

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

    const isThereAtLeastOneJot = initialPrompts.length > 0;

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
        refetchOnMount: 'always'
    });

    function handleFilterChange(newOptions: Partial<SearchOptions>) {
        setSearchOptions(prev => ({ ...prev, ...newOptions }));
    }

    return (
        <div className="mt-12">
            {isThereAtLeastOneJot && (
                <div className="absolute top-[40px] right-0">
                    <CreateNewJot />
                </div>
            )}
            {/* Insert all the prompt jot cards here */}
            {fetchedPrompts && fetchedPrompts.length > 0 ? (
                <>
                    <PromptFilterOptions
                        searchOptionState={searchOptions}
                        getFilteredSearch={handleFilterChange}
                        categories={categories}
                    />
                    <div className="mt-10 mb-10 ">
                        <div className="mb-8 grid-cols-1 lg:grid-cols-2 grid gap-7">
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
                </>
            ) : (
                isFetching ? (
                    <div className="flex flex-col justify-center items-center mt-16">
                        <h3 className="h3-bold">Loading Jots...</h3>
                        <LoadingAnimation />
                    </div>
                ) : (
                    // Only show this when there are no jots at all
                    !isThereAtLeastOneJot && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 w-full max-w-[450px] mx-auto mt-10">
                            <div className="bg-card border shadow-sm rounded-lg p-8 text-center">
                                <h2 className="text-2xl sm:text-3xl font-bold mb-3">Your Jot Library is Empty</h2>
                                <p className="text-muted-foreground mb-5 text-base sm:text-lg">
                                    Create Your First Jot and Assign it to Your Class!
                                </p>
                                <CreateNewJot />
                            </div>
                            <div className="shadow-lg">
                                <LiteYouTubeEmbed
                                    id="gCxIeBKOiZs"
                                    title={`JotterBlog Tutorial - Jots`}
                                />
                            </div>
                        </div>
                    )
                )
            )}
        </div >
    )
}

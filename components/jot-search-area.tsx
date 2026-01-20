'use client'
import { Prompt, PromptCategory } from "@/types"
import { useState, useRef } from "react"
import PromptFilterOptions from "./shared/prompt-filter-options"
import PromptCard from "./shared/prompt-card"
import { SearchOptions } from "@/types"
import { Classroom } from "@/types"
import PaginationList from "./shared/prompt-filter-options/pagination-list"
import CreateNewJot from "./modalBtns/create-new-jot"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

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


    const [fetchedPrompts, setFetchedPrompts] = useState<Prompt[]>(initialPrompts);

    // Make the following into one state object
    const promptSearchOptions = useRef<SearchOptions>({
        category: '',
        filter: '',
        paginationSkip: 0,
        searchWords: ''
    });

    async function getFilteredSearch(filterOptions: SearchOptions) {
        try {
            const queryParams = new URLSearchParams({
                teacherId: teacherId,
                category: filterOptions.category || "",
                searchWords: filterOptions.searchWords || "",
                filter: filterOptions.filter || "",
                paginationSkip: filterOptions.paginationSkip.toString()
            });

            const response = await fetch(`/api/prompts/filtered?${queryParams}`);
            if (response.ok) {
                const { prompts } = await response.json();
                setFetchedPrompts(prompts as Prompt[]);
            } else {
                console.error('Failed to fetch filtered prompts:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching filtered prompts:', error);
        }
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
                <div className="mt-10 mb-10 ">
                    <div className="mb-8 grid-cols-1 xl:grid-cols-2 grid gap-6 items-start">
                        {fetchedPrompts.map((prompt: Prompt) => (
                            <PromptCard
                                key={prompt.id}
                                promptData={prompt}
                                updatePromptData={setFetchedPrompts}
                                classroomData={classroomData}
                                teacherId={teacherId}
                            />
                        ))}
                    </div>
                    <PaginationList
                        searchOptionsRef={promptSearchOptions}
                        getFilteredSearch={getFilteredSearch}
                        totalItems={totalPromptCount}
                        itemsPerPage={20}
                    />
                </div>
            ) : (
                <>
                    <p className="text-center font-bold text-muted-foreground text-2xl mt-10">No Jots in your Library</p>
                    {/* <p className="text-center">Create Your first Jot</p> */}
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
            )}
        </div>
    )
}

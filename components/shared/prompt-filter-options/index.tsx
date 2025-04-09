
import { PromptCategory, SearchOptions } from "@/types"
import CategoryFilterCombobox from "./category-filter-combobox"
import PromptSearchBar from "./prompt-search-bar"
import TraitFilterCombobox from "./trait-filter-combobox"

interface Props {
    searchOptionsRef: React.RefObject<SearchOptions>;
    getFilteredSearch: (filterOptions: SearchOptions) => void;
    categories: PromptCategory[]
}
export default function PromptFilterOptions({
    searchOptionsRef,
    getFilteredSearch,
    categories

}: Props) {

    const traitFilterOptions = [
        {
            value: "multi-question",
            label: "Assessments",
        },
        {
            value: "single-question",
            label: "Blog Prompts",
        },
        {
            value: "never-assigned",
            label: "Never Assigned",
        },
        {
            value: "asc",
            label: "Oldest",
        },
        {
            value: "desc",
            label: "Newest",
        },
    ]

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-5 mt-10">
            <PromptSearchBar
                searchOptionsRef={searchOptionsRef}
                getFilteredSearch={getFilteredSearch}
            />
            <TraitFilterCombobox
                options={traitFilterOptions}
                searchOptionsRef={searchOptionsRef}
                getFilteredSearch={getFilteredSearch}
            />
            <CategoryFilterCombobox
                searchOptionsRef={searchOptionsRef}
                categories={categories}
                getFilteredSearch={getFilteredSearch}
            />
        </div>
    )
}

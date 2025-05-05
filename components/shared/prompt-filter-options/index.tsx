import { PromptCategory, SearchOptions } from "@/types"
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
            value: "ASSESSMENT",
            label: "Assessments",
        },
        {
            value: "BLOG",
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

    // convert categories data into consumable combobox data
    const categoryFilterOptions = categories.map(category => ({
        value: category.id,
        label: category.name
    }))

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-5 mt-10">
            <PromptSearchBar
                searchOptionsRef={searchOptionsRef}
                getFilteredSearch={getFilteredSearch}
            />
            <TraitFilterCombobox
                searchOptionsRef={searchOptionsRef}
                options={traitFilterOptions}
                field='filter'
                getFilteredSearch={getFilteredSearch}
            />
            <TraitFilterCombobox
                searchOptionsRef={searchOptionsRef}
                options={categoryFilterOptions}
                field='category'
                getFilteredSearch={getFilteredSearch}
            />
        </div>
    )
}

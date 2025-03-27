
import { PromptCategory, SearchOptions } from "@/types"
import ClassFilterCombobox from "./class-filter-combobox"
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

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-5 mt-10">
            <PromptSearchBar
                searchOptionsRef={searchOptionsRef}
                getFilteredSearch={getFilteredSearch}
            />
            <TraitFilterCombobox
                searchOptionsRef={searchOptionsRef}
                getFilteredSearch={getFilteredSearch}
            />
            <ClassFilterCombobox
                searchOptionsRef={searchOptionsRef}
                categories={categories}
                getFilteredSearch={getFilteredSearch}
            />
        </div>
    )
}

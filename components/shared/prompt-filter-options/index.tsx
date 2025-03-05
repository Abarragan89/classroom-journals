
import { Classroom, SearchOptions } from "@/types"
import ClassFilterCombobox from "./class-filter-combobox"
import PromptSearchBar from "./prompt-search-bar"
import TraitFilterCombobox from "./trait-filter-combobox"

interface Props {
    searchOptionsRef: React.RefObject<SearchOptions>;
    classroomData: Classroom[],
    getFilteredSearch: (filterOptions: SearchOptions) => void
}
export default function PromptFilterOptions({
    searchOptionsRef,
    classroomData,
    getFilteredSearch

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
                classroomData={classroomData}
                getFilteredSearch={getFilteredSearch}
            />
        </div>
    )
}

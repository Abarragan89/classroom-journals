
import { ClassroomIds, SearchOptions } from "@/types"
import ClassFilterCombobox from "./class-filter-combobox"
import PromptSearchBar from "./prompt-search-bar"
import TraitFilterCombobox from "./trait-filter-combobox"

interface Props {
    searchOptionsRef: React.RefObject<SearchOptions>;
    classroomData: ClassroomIds[],
    getFilteredSearch: (filterOptions: SearchOptions) => void
}
export default function PromptFilterOptions({
    searchOptionsRef,
    classroomData,
    getFilteredSearch

}: Props) {
    
    return (
        <div className="flex space-y-5 flex-col md:space-y-0 md:flex-row md:justify-between items-end flex-wrap mt-10">
            <div className="w-[350px] md:max-w-[215px] mx-auto">
                <PromptSearchBar
                    searchOptionsRef={searchOptionsRef}
                    getFilteredSearch={getFilteredSearch}
                />
            </div>
            <div className="flex-center mx-auto w-[350px] md:max-w-[215px]">
                <p className="text-right pr-2">Filter:</p>
                <TraitFilterCombobox
                    searchOptionsRef={searchOptionsRef}
                    getFilteredSearch={getFilteredSearch}
                />
            </div>
            <div className="flex-center mx-auto w-[350px] md:max-w-[215px]">
                <p className="text-right pr-2">Class:</p>
                <ClassFilterCombobox
                    searchOptionsRef={searchOptionsRef}
                    classroomData={classroomData}
                    getFilteredSearch={getFilteredSearch}
                />
            </div>
        </div>
    )
}

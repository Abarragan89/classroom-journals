import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { SearchOptions } from "@/types"

interface Props {
    searchOptionState: SearchOptions;
    getFilteredSearch: (filterOptions: SearchOptions) => void;
}

export default function PromptSearchBar({ searchOptionState, getFilteredSearch }: Props) {
    const handlePromptTraitChange = (value: string) => {
        // Update the ref object directly
        searchOptionState = {
            ...searchOptionState,
            searchWords: value
        };
        // Call getFilteredSearch with the updated options
        getFilteredSearch(searchOptionState);
    };
    return (
        <div className="relative col-span-2 sm:col-span-1">
            <Search size={20} className="absolute bottom-2 left-1 text-border" />
            <Input
                className="pl-8"
                type="email"
                placeholder="Search by title..."
                onChange={(e) => (handlePromptTraitChange(e.target.value))}
            />
        </div>
    )
}

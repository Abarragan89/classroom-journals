import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { SearchOptions } from "@/types"

interface Props {
    searchOptionsRef: React.RefObject<SearchOptions>;
    getFilteredSearch: (filterOptions: SearchOptions) => void;
}

export default function PromptSearchBar({ searchOptionsRef, getFilteredSearch }: Props) {

    const handlePromptTraitChange = (value: string) => {
        // Update the ref object directly
        searchOptionsRef.current = {
            ...searchOptionsRef.current,
            searchWords: value
        };
        // Call getFilteredSearch with the updated options
        getFilteredSearch(searchOptionsRef.current);
    };
    return (
        <div className="relative">
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

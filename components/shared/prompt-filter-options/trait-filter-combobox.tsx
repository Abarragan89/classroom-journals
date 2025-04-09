"use client"
import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { SearchOptions } from "@/types"

interface Props {
    searchOptionsRef: React.RefObject<SearchOptions>;
    field: string,
    options: { value: string; label: string }[]
    getFilteredSearch: (filterOptions: SearchOptions) => void;
}

export default function TraitFilterCombobox({
    searchOptionsRef,
    field,
    getFilteredSearch,
    options
}: Props) {


    const [open, setOpen] = useState<boolean>(false)
    const [value, setValue] = useState<string>(options?.[0].value)

    const handlePromptTraitChange = (value: string) => {
        // Update the ref object directly
        searchOptionsRef.current = {
            ...searchOptionsRef.current,
            [field]: value
        };
        // Call getFilteredSearch with the updated options
        getFilteredSearch(searchOptionsRef.current);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger className="w-full" asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between truncate relative overflow-hidden"
                >
                    <span className="block truncate max-w-[140px]">{value
                        ? options.find((option) => option.value === value)?.label
                        : "All Classes..."}</span>
                    <div className="absolute right-6 top-0 bottom-0 w-8 pointer-events-none"></div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
                <Command>
                    <CommandList>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                        handlePromptTraitChange(currentValue)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

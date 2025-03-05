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
import { Classroom, SearchOptions } from "@/types"

interface Props {
    searchOptionsRef: React.RefObject<SearchOptions>;
    classroomData: Classroom[];
    getFilteredSearch: (filterOptions: SearchOptions) => void;
}

export default function ClassFilterCombobox({
    searchOptionsRef,
    classroomData,
    getFilteredSearch
}: Props) {

    const [open, setOpen] = useState<boolean>(false)
    const [value, setValue] = useState<string>("")

    const handleClassroomChange = (value: string) => {
        // Update the ref object directly
        searchOptionsRef.current = {
            ...searchOptionsRef.current,
            classroom: value
        };

        // Call getFilteredSearch with the updated options
        getFilteredSearch(searchOptionsRef.current);

    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between truncate relative overflow-hidden"
                >
                    <span className="block truncate">{value
                        ? classroomData.find((classroom) => classroom.id === value)?.name
                        : "All Classes..."}</span>
                    <div className="absolute right-6 top-0 bottom-0 w-8 pointer-events-none"></div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
                <Command>
                    <CommandList>
                        <CommandGroup>
                            {classroomData.map((classroom) => (
                                <CommandItem
                                    key={classroom.id}
                                    value={classroom.id}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                        handleClassroomChange(currentValue)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === classroom.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {classroom.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

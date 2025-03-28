"use client"
import { Response } from "@/types"
import { useEffect, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { useRouter, usePathname, useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function StudentComboBox({
    responses,
}: {
    responses: Response[]
}) {

    const pathname = usePathname();
    const params = useParams();
    const { responseId } = params;
    const urlSegment = pathname.split('/').slice(1, 6).join('/')
    const router = useRouter();
    const [open, setOpen] = useState<boolean>(false)
    const [value, setValue] = useState<string>("")
    const [currentStudentIndex, setCurrentStudentIndex] = useState<number>(responses.findIndex(response => response.id === responseId))

    useEffect(() => {
        setCurrentStudentIndex(responses.findIndex(response => response.id === responseId))
    }, [params])


    return (
        <div className="flex-start justify-center mt-4">
            <h2 className="text-2xl lg:text-2xl mr-3">Response By: </h2>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="text-2xl py-5 px-5"
                    >
                        <div className="flex items-baseline">
                            {responses?.[currentStudentIndex]?.student?.name} <span className="text-[1.2rem] ml-2">({responses?.[currentStudentIndex].score})</span>
                        </div>
                        <ChevronsUpDown className="opacity-50 ml-3" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                    <Command defaultValue={responses?.[currentStudentIndex]?.student?.name}>
                        <CommandInput placeholder="Search student..." />
                        <CommandList>
                            <CommandEmpty>No framework found.</CommandEmpty>
                            <CommandGroup>
                                {responses.map((response) => (
                                    <CommandItem
                                        key={response?.id}
                                        value={response?.student?.name}
                                        onSelect={(currentValue) => {
                                            router.push(`/${urlSegment}/single-response/${response.id}`)
                                            setValue(currentValue === value ? "" : currentValue)
                                            setOpen(false)
                                        }}
                                    >
                                        {response.student?.name} <span className="text-sm">({response.score})</span>
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                value === response?.student?.name ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}

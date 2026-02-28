"use client"
import { Response } from "@/types"
import { useMemo, useState } from "react"
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

    const currentStudentIndex = useMemo(() => {
        return responses.findIndex(response => response.id === responseId);
    }, [responses, responseId]);


    return (
        <>
            <div className="flex flex-col items-start sm:flex-row sm:items-center mt-4">
                <h2 className="text-xl lg:text-2xl mr-3">Response By: </h2>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="text-xl sm:text-2xl py-5 px-5"
                        >
                            <div className="flex items-baseline">
                                {responses?.[currentStudentIndex]?.student?.name} <span className="text-[1.1rem] ml-2">({responses?.[currentStudentIndex].score})</span>
                            </div>
                            <ChevronsUpDown className="opacity-50 ml-3" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                        <Command defaultValue={responses?.[currentStudentIndex]?.student?.name} className="w-[320px]">
                            <CommandInput placeholder="Search student..." />
                            <CommandList>
                                <CommandEmpty>No student found.</CommandEmpty>
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
                                            <div className="flex-between w-full">
                                                <p>{response?.student?.name?.split(" ")[0]}  {response?.student?.name?.split(" ")[1]}</p>
                                                <span className="text-sm block">({response.score})</span>
                                            </div>
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
            <div className="flex gap-2 mb-2 mt-3">
                <Button
                    variant="outline"
                    onClick={() => {
                        const prevIndex = (currentStudentIndex - 1 + responses.length) % responses.length;
                        router.push(`/${urlSegment}/single-response/${responses[prevIndex].id}`);
                    }}
                    disabled={responses.length === 0}
                >
                    ← Previous
                </Button>
                <Button
                    variant="outline"
                    onClick={() => {
                        const nextIndex = (currentStudentIndex + 1) % responses.length;
                        router.push(`/${urlSegment}/single-response/${responses[nextIndex].id}`);
                    }}
                    disabled={responses.length === 0}
                >
                    Next →
                </Button>
            </div>
        </>
    )
}

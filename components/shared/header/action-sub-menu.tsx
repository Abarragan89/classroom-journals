'use client'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { Plus } from "lucide-react";
import { useState } from "react";
import AddClassBtn from "@/components/forms/add-class-btn";
import AddPromptBtn from "@/components/forms/add-prompt-btn";
import { Button } from "@/components/ui/button";

export default function ActionSubMenu({ teacherId }: { teacherId: string }) {

    const [isOpen, setIsOpen] = useState<boolean>(false)

    function closeModal() {
        setIsOpen(false)
    }


    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className="focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full px-[10px] py-2">
                    <Plus className="hover:cursor-pointer hover:bg-background" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
                <DropdownMenuItem className="hover:cursor-pointer rounded-md" onSelect={(e) => e.preventDefault()}>
                    <div onClick={(e) => {e.stopPropagation()}}>
                        <AddClassBtn teacherId={teacherId!} closeSubMenu={closeModal} />
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:cursor-pointer rounded-md" onSelect={(e) => e.preventDefault()}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <AddPromptBtn teacherId={teacherId!} closeSubMenu={closeModal} />
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>

        </DropdownMenu>
    )
}

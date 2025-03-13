'use client'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { Plus } from "lucide-react";
import { useState } from "react";
import AddClassBtn from "@/components/forms/class-forms/add-class-btn";
import { Button } from "@/components/ui/button";
import JotTypeModal from "@/components/modals/jot-type-modal";
import { Session } from "@/types";

export default function ActionSubMenu({
    teacherId,
    session
}: {
    teacherId: string,
    session: Session
}) {

    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isNewJotModalOpen, setIsNewJotModalOpen] = useState<boolean>(false)

    function closeModal() {
        setIsOpen(false)
        setIsNewJotModalOpen(false)
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
                    <div onClick={(e) => { e.stopPropagation() }}>
                        <AddClassBtn teacherId={teacherId!} closeSubMenu={closeModal} session={session} />
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:cursor-pointer rounded-md" onSelect={(e) => e.preventDefault()}>
                    <JotTypeModal
                        isModalOpen={isNewJotModalOpen}
                        setIsModalOpen={setIsNewJotModalOpen}
                        closeModal={closeModal}
                    />
                    <Button className="w-full" variant='ghost' onClick={() => setIsNewJotModalOpen(true)}>
                        <Plus /> New Jot
                    </Button>
                </DropdownMenuItem>
            </DropdownMenuContent>

        </DropdownMenu>
    )
}

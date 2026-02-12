'use client'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { Plus, PenIcon } from "lucide-react";
import { useState } from "react";
import AddClassBtn from "@/components/forms/class-forms/add-class-btn";
import { Button } from "@/components/ui/button";
import JotTypeModal from "@/components/modals/jot-type-modal";
import { Session } from "@/types";

export default function ActionSubMenu({
    teacherId,
    session,
    isAllowedToMakeNewClass,
    isMobile = false
}: {
    teacherId: string,
    session: Session,
    isAllowedToMakeNewClass: boolean;
    isMobile?: boolean
}) {

    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isNewJotModalOpen, setIsNewJotModalOpen] = useState<boolean>(false)

    function closeModal() {
        setIsOpen(false)
        setIsNewJotModalOpen(false)
    }

    if (isMobile) {
        return (
            <>
                <AddClassBtn
                    teacherId={teacherId}
                    closeSubMenu={closeModal}
                    session={session}
                    isAllowedToMakeNewClass={isAllowedToMakeNewClass}
                    isMobile={isMobile}
                />
                <JotTypeModal
                    isModalOpen={isNewJotModalOpen}
                    setIsModalOpen={setIsNewJotModalOpen}
                    closeModal={closeModal}
                />
                <Button
                    className="w-full justify-start gap-3 px-4 py-3 h-auto text-sm font-normal rounded-md hover:bg-accent text-muted-foreground"
                    variant='ghost'
                    onClick={() => setIsNewJotModalOpen(true)}
                >
                    <PenIcon size={18} />
                    <span>New Jot</span>
                </Button>
            </>
        )
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
                        <AddClassBtn
                            teacherId={teacherId!}
                            closeSubMenu={closeModal}
                            session={session}
                            isAllowedToMakeNewClass={isAllowedToMakeNewClass}
                        />
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

"use client"
import { useState } from "react"
import { ResponsiveDialog } from "@/components/responsive-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function QuipsClientWraper() {

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    return (
        <>
            <ResponsiveDialog
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                title="New Quip"
            >
                Make
            </ResponsiveDialog>
            <Button className="absolute top-[40px] right-0">
                <Plus /> New Quip
            </Button>
        </>
    )
}

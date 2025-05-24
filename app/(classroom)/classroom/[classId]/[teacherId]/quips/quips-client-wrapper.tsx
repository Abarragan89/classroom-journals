"use client"
import { useState } from "react"
import { ResponsiveDialog } from "@/components/responsive-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import CreateQuipForm from "@/components/forms/quip-forms/create-quip"
import { PromptSession } from "@/types";
import QuipListSection from "@/components/shared/quip-list-section"
import { ClassUserRole } from "@prisma/client"

export default function QuipsClientWraper({
    classId,
    teacherId,
    allQuips,
    role,
}: {
    classId: string;
    teacherId: string;
    allQuips: PromptSession[]
    role: ClassUserRole
}) {

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [currentQuips, setCurrentQuips] = useState<PromptSession[]>(allQuips)

    function closeModal() {
        setIsModalOpen(false)
    }
    return (
        <>
            <ResponsiveDialog
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                title="Create Quip"
            >
                <CreateQuipForm
                    classId={classId}
                    teacherId={teacherId}
                    closeModal={closeModal}
                    setCurrentQuips={setCurrentQuips}
                />
            </ResponsiveDialog>
            <div className="flex-end my-4">
                <Button onClick={() => setIsModalOpen(true)} className="">
                    <Plus /> New Quip
                </Button>
            </div>

            <QuipListSection
                allQuips={currentQuips}
                role={role}
                userId={teacherId}
                classId={classId}
            />
        </>
    )
}

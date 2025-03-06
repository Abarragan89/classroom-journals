'use client'
import { ResponsiveDialog } from "../responsive-dialog"
import { Button } from "../ui/button"
import Link from "next/link"

export default function JotTypeModal({
    isModalOpen,
    setIsModalOpen,
    closeModal
}: {
    isModalOpen: boolean,
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    closeModal?: () => void
}) {


    return (
        <ResponsiveDialog
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
            title={`Choose Jot Type`}
            description='Chose between journal entry or mulit-question assessment'
        >
            <div className="flex flex-col justify-center space-y-6 mx-auto my-4">
                <Button asChild>
                    <Link onClick={closeModal} href={'/create-prompt?type=single-question'}>
                        Journal Entry / Essay
                    </Link>
                </Button>
                <Button asChild>
                    <Link onClick={closeModal} href={'/create-prompt?type=multi-question'}>
                        Multi-Question / Assessment
                    </Link>
                </Button>
            </div>

        </ResponsiveDialog>
    )
}

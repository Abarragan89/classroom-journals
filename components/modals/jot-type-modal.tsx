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
            <div className="flex flex-col justify-center space-y-6 mx-auto mt-4">
                <Button asChild>
                    <Link onClick={closeModal} href={'/create-prompt?type=single-question'}>
                        Journal Jot
                    </Link>
                </Button>
                <Button asChild>
                    <Link onClick={closeModal} href={'/create-prompt?type=multi-question'}>
                        Multi-Question Assessment
                    </Link>
                </Button>
            </div>
            <p className="text-sm my-2 text-center italic w-3/4 mx-auto">All prompt types can be scored and commented</p>
            {/* <p className="text-sm mb-4 text-center italic w-3/4 mx-auto">Commenting settings can be adujsted within your classes.</p> */}
        </ResponsiveDialog>
    )
}

'use client'
import { ResponsiveDialog } from "../responsive-dialog"
import { Button } from "../ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function JotTypeModal({
    isModalOpen,
    setIsModalOpen,
    closeModal,
}: {
    isModalOpen: boolean,
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    closeModal?: () => void,
}) {

    const pathname = usePathname();

    return (
        <ResponsiveDialog
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
            title={`Choose Jot Type`}
            description='Choose between essay/journal prompt or multi-question assessment'
        >
            <p className="text-muted-foreground">Jots appear in your library and can be assigned to classes</p>
            <div className="flex flex-col justify-center space-y-6 mx-auto my-3">
                <Button asChild>
                    <Link onClick={closeModal} href={`/prompt-form?type=blog&callbackUrl=${pathname}`}>
                        Essay / Journal Prompt
                    </Link>
                </Button>
                <Button asChild>
                    <Link onClick={closeModal} href={`/prompt-form?type=assessment&callbackUrl=${pathname}`}>
                        Exit-Ticket / Assessment
                    </Link>
                </Button>
            </div>
        </ResponsiveDialog>
    )
}

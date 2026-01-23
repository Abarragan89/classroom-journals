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
            showDescription={true}
            description='Select the type of jot you would like to create.'
        >
            {/* <p className="text-muted-foreground"></p> */}
            <div className="flex-center gap-x-6 mx-auto my-3">
                <Button variant={"secondary"} asChild className="h-auto py-3">
                    <Link
                        onClick={closeModal}
                        href={`/prompt-form?type=blog&callbackUrl=${pathname}`}
                    >
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex flex-col items-center">
                                <div className="flex-center">
                                    <span className="text-2xl font-semibold ml-1 tracking-wider">Blog</span>
                                </div>
                                <span className="text-[.78rem] text-muted-foreground">(Writing Prompt)</span>
                            </div>
                        </div>
                    </Link>
                </Button>
                <Button variant={"secondary"} asChild className="h-auto py-3">
                    <Link onClick={closeModal} href={`/prompt-form?type=assessment&callbackUrl=${pathname}`}>

                        <div className="flex flex-col items-center gap-1">
                            <div className="flex flex-col items-center">
                                <div className="flex-center">
                                    <span className="text-2xl font-semibold ml-1 tracking-wider">Assessment</span>
                                </div>
                                <span className="text-[.78rem] text-muted-foreground">(Exit Ticket / Quiz)</span>
                            </div>
                        </div>
                    </Link>
                </Button>
            </div>
        </ResponsiveDialog >
    )
}

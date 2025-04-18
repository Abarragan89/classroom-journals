'use client'
import { ResponsiveDialog } from "../responsive-dialog"
import { Button } from "../ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function JotTypeModal({
    isModalOpen,
    setIsModalOpen,
    closeModal,
    isAllowedToMakePrompt
}: {
    isModalOpen: boolean,
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    closeModal?: () => void,
    isAllowedToMakePrompt: boolean
}) {

    const pathname = usePathname();

    return (
        <ResponsiveDialog
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
            title={`Choose Jot Type`}
            description='Choose between blog prompt or mulit-question assessment'
        >
            {isAllowedToMakePrompt ?
                <div className="flex flex-col justify-center space-y-6 mx-auto my-5">
                    <Button asChild>
                        <Link onClick={closeModal} href={`/prompt-form?type=single-question&callbackUrl=${pathname}`}>
                            Blog Prompt
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link onClick={closeModal} href={`/prompt-form?type=multi-question&callbackUrl=${pathname}`}>
                            Multi-Question Assessment
                        </Link>
                    </Button>
                </div>
                :
                <div className="text-center my-2">
                    <p>
                        <span className="text-destructive font-bold">Out of Space! </span>
                        Upgrade your account Or delete some Jots to make space. Class data will NOT be affected
                    </p>
                    <Button asChild className="mt-5">
                        <Link
                            onClick={closeModal}
                            href={'/teacher-account#subscription-section'}
                        >
                            Upgrade Now!
                        </Link>
                    </Button>
                </div>

            }
        </ResponsiveDialog>
    )
}

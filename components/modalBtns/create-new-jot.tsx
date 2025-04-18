'use client'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import JotTypeModal from '../modals/jot-type-modal'

export default function CreateNewJot({
    isAllowedToMakePrompt
}: {
    isAllowedToMakePrompt: boolean
}) {
    const [isJotTypeModalOpen, setIsJotTypeModalOpen] = useState<boolean>(false)

    return (
        <>
            <JotTypeModal
                closeModal={undefined}
                setIsModalOpen={setIsJotTypeModalOpen}
                isModalOpen={isJotTypeModalOpen}
                isAllowedToMakePrompt={isAllowedToMakePrompt}
            />
            <Button onClick={() => setIsJotTypeModalOpen(true)} variant='secondary'>
                <Plus />Create Jot
            </Button>
        </>

    )
}

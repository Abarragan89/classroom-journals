'use client'
import { useState } from "react"
import { ResponsiveDialog } from "../responsive-dialog"
import { Button } from "../ui/button"
import Link from "next/link"

export default function JotTypeModal({
    isModalOpen,
    setIsModalOpen
}: {
    isModalOpen: boolean,
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {


    return (
        <ResponsiveDialog
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
            title={`Jot Type`}
            description='Chose between journal entry or mulit-question assessment'
        >
            <div className="flex flex-col justify-center mx-auto space-y-6 wrapper">
                <p>Choose the type of Jot you would like to create</p>
                <Button asChild>
                    <Link href={'/create-prompt?type=single-question'}>
                        Journal Entry / Essay
                    </Link>
                </Button>
                <Button asChild>
                    <Link href={'/create-prompt?type=multi-question'}>
                        Multi-question / Assessment
                    </Link>
                </Button>
            </div>

        </ResponsiveDialog>
    )
}

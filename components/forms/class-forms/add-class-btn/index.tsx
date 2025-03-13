'use client';
import { Button } from "@/components/ui/button"
import { useState } from "react";
import { Plus } from "lucide-react"
import AddClassForm from "./add-class-form"
import { ResponsiveDialog } from "@/components/responsive-dialog"
import { GoogleClassroom, Session } from "@/types";
import GoogleClassroomOptions from "./google-classroom-options";

export default function AddClassBtn({
    teacherId,
    closeSubMenu,
    variant = 'ghost',
    session
}: {
    teacherId: string,
    closeSubMenu?: () => void,
    variant?: "ghost" | "link" | "default" | "destructive" | "outline" | "secondary" | null | undefined,
    session: Session
}) {

    const [isModalOpen, setIsOpenModal] = useState<boolean>(false)
    const [googleClassroomArr, setGoogleClassroomArr] = useState<GoogleClassroom[]>([])
    const [showGoogleClassrooms, setShowGoogleClassrooms] = useState<boolean>(false)


    function closeModal() {
        setIsOpenModal(false)
        if (closeSubMenu) closeSubMenu()
    }

    function updateGoogleClassrooms(classes: GoogleClassroom[], isOpen:boolean) {
        setGoogleClassroomArr(classes)
        setShowGoogleClassrooms(isOpen)
    }

    return (
        <>
            <ResponsiveDialog
                isOpen={isModalOpen}
                setIsOpen={closeModal}
                title="Create Class"
                description="Fill out the form below to create a new class."
            >
                {showGoogleClassrooms ?
                    <div className="mt-3">
                        <GoogleClassroomOptions
                            googleClassrooms={googleClassroomArr}
                            updateGoogleClassrooms={updateGoogleClassrooms}
                            session={session as Session}
                            teacherId={teacherId}
                        />
                    </div>
                    :
                    <AddClassForm
                        teacherId={teacherId}
                        closeModal={closeModal}
                        session={session as Session}
                        updateGoogleClassrooms={updateGoogleClassrooms}
                    />
                }

            </ResponsiveDialog>
            <Button className="w-full" variant={variant} onClick={() => setIsOpenModal(true)}>
                <Plus />Add Class
            </Button>
        </>
    )
}
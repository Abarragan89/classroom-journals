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

    function closeModal() {
        setIsOpenModal(false)
        if (closeSubMenu) closeSubMenu()
    }

    return (
        <>
            <ResponsiveDialog
                isOpen={isModalOpen}
                setIsOpen={closeModal}
                title="Create Class"
                description="Fill out the form below to create a new class."
            >
                {googleClassroomArr?.length > 0 ?
                    <div className="mt-3">
                        <GoogleClassroomOptions
                            googleClassrooms={googleClassroomArr}
                            updateGoogleClassrooms={setGoogleClassroomArr}
                            session={session as Session}
                        />
                    </div>
                    :
                    <AddClassForm
                        teacherId={teacherId}
                        closeModal={closeModal}
                        session={session as Session}
                        updateGoogleClassrooms={setGoogleClassroomArr}
                    />
                }

            </ResponsiveDialog>
            <Button variant={variant} onClick={() => setIsOpenModal(true)}>
                <Plus />Add Class
            </Button>
        </>
    )
}
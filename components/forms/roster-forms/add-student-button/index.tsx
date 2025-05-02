'use client';
import { Button } from "@/components/ui/button"
import { useState } from "react";
import {  UserRoundPlus } from "lucide-react"
import AddStudentForm from "./add-student-form";
import { ResponsiveDialog } from "@/components/responsive-dialog"
import { GoogleClassroom, Session } from "@/types";
import AddGoogleStudents from "./add-google-students";

export default function AddStudentBtn({
    classId,
    closeSubMenu,
    variant = 'ghost',
    session
}: {
    classId: string,
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

    function updateGoogleClassrooms(classes: GoogleClassroom[], isOpen: boolean) {
        setGoogleClassroomArr(classes)
        setShowGoogleClassrooms(isOpen)
    }

    return (
        <>
            <ResponsiveDialog
                isOpen={isModalOpen}
                setIsOpen={closeModal}
                title="Add Student"
                description="Fill out form to add student to your roster"
            >
                {showGoogleClassrooms ?
                    <div className="mt-3">
                        <AddGoogleStudents
                            googleClassrooms={googleClassroomArr}
                            updateGoogleClassrooms={updateGoogleClassrooms}
                            session={session as Session}
                            classId={classId}
                            closeModal={closeModal}
                        />
                    </div>
                    :
                    <AddStudentForm
                        classId={classId}
                        closeModal={closeModal}
                        session={session as Session}
                        updateGoogleClassrooms={updateGoogleClassrooms}
                    />
                }

            </ResponsiveDialog>
            <Button className="w-11 h-11 rounded-full z-20" onClick={() => setIsOpenModal(true)}>
                <UserRoundPlus />
            </Button>
        </>
    )
}
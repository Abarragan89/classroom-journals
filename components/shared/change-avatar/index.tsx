"use client"
import { useState } from "react";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import UpdateAvatar from "@/components/forms/avatar-forms/update-avatar";

export default function ChangeAvatar({
    // userId,
    // avatarSrc
}: {
    // userId: string;
    // avatarSrc: string;
}) {

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    return (
        <>
            <ResponsiveDialog
                title="Update Avatar"
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
            >
                {/* <UpdateAvatar 
                    setOpenPhotoModal={setIsModalOpen}
                /> */}
                <>j</>
            </ResponsiveDialog>
            <div className="flex items-end relative w-fit">
                <p className="relative w-[70px] h-[70px] border border-primary bg-primary text-primary-foreground rounded-full flex items-center justify-center text-3xl">
                    {'M'}
                </p>
                <Button onClick={() => setIsModalOpen(true)} variant={'link'} className="p-0 text-xs absolute -bottom-3 -right-10">
                    Change
                </Button>
            </div>
        </>
    )
}

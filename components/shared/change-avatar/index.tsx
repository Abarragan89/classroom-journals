"use client"
import { useState } from "react";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import UpdateAvatar from "@/components/forms/avatar-forms/update-avatar";
import Image from "next/image";

export default function ChangeAvatar({
    userId,
    avatarSrc
}: {
    userId: string;
    avatarSrc: string;
}) {

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [currentAvatar, setCurrentAvatar] = useState<string>(avatarSrc)


    return (
        <>
            <ResponsiveDialog
                title="Update Avatar"
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
            >
                {isModalOpen && (
                    <UpdateAvatar
                        setOpenPhotoModal={setIsModalOpen}
                        userId={userId}
                        setCurrentAvatar={setCurrentAvatar}
                    />
                )}
            </ResponsiveDialog>
            <div className="flex items-end relative w-fit mt-3 mb-5">
                <Image
                    src={currentAvatar || '/images/demo-avatars/1.png'}
                    alt="blog cover photo"
                    width={80}
                    height={80}
                    className="hover:cursor-pointer hover:scale-105 rounded-full w-[80px] h-[80px]"
                />
                <Button onClick={() => setIsModalOpen(true)} variant={'link'} className="p-0 text-xs absolute -bottom-3 -right-10">
                    Change
                </Button>
            </div>
        </>
    )
}

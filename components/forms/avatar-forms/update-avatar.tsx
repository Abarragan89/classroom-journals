"use client"
import LoadingAnimation from "@/components/loading-animation";
import { updateUserAvatar } from "@/lib/actions/profile.action";
import { BlogImage } from "@/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function UpdateAvatar({
    setOpenPhotoModal,
    userId,
    setCurrentAvatar
}: {
    setOpenPhotoModal: React.Dispatch<React.SetStateAction<boolean>>
    userId: string;
    setCurrentAvatar: React.Dispatch<React.SetStateAction<string>>
}) {

    const [isLoadingPhotos, setIsLoadingPhotos] = useState<boolean>(false);
    const [allAvatarPhotos, setAllAvatarPhotos] = useState<BlogImage[] | null>(null);
    const { update } = useSession();


    useEffect(() => {
        fetchPhotos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    async function fetchPhotos() {
        if (allAvatarPhotos !== null) return
        try {
            setIsLoadingPhotos(true)
            const response = await fetch('/api/images/avatars');
            if (!response.ok) {
                throw new Error('Failed to fetch avatar photos');
            }
            const data = await response.json();
            setAllAvatarPhotos(data.avatars);
        } catch (error) {
            console.error('error getting avatar photos ', error)
        } finally {
            setIsLoadingPhotos(false)
        }
    }

    async function updateUserAvatarHandler(imageUrl: string) {
        try {
            const result = await updateUserAvatar(imageUrl, userId)
            if (result?.success) {
                setCurrentAvatar(imageUrl)
                // Update NextAuth session with new avatar - this triggers session callback to refresh
                await update({
                    user: {
                        avatarURL: imageUrl
                    }
                });
            }
        } catch (error) {
            console.error('error updating url', error)
        }
    }

    return (
        <form>
            <>
                {(isLoadingPhotos || !allAvatarPhotos) ? (
                    <div className="flex-center h-[355px]">
                        <LoadingAnimation />
                    </div>
                ) : (
                    <>
                        <div className="h-[355px] mx-auto overflow-y-auto flex-center flex-wrap gap-3 custom-scrollbar">
                            {allAvatarPhotos && allAvatarPhotos.map((img) => (
                                <Image
                                    key={img.id}
                                    src={img.url}
                                    alt="blog cover photo"
                                    width={80}
                                    height={80}
                                    onClick={() => { updateUserAvatarHandler(img.url); setOpenPhotoModal(false) }}
                                    className="hover:cursor-pointer hover:scale-105 rounded-full w-[80px] h-[80px]"
                                />
                            ))}
                        </div>
                    </>
                )}
            </>
        </form>
    )
}

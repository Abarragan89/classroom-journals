"use client"
import LoadingAnimation from "@/components/loading-animation";
import { updateUserAvatar } from "@/lib/actions/profile.action";
import { getAllAvatarPhotos } from "@/lib/actions/s3-upload";
import { BlogImage } from "@/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
    const queryClient = useQueryClient();


    useEffect(() => {
        fetchPhotos();
    }, [])


    async function fetchPhotos() {
        if (allAvatarPhotos !== null) return
        try {
            setIsLoadingPhotos(true)
            const photos = await getAllAvatarPhotos() as BlogImage[]
            setAllAvatarPhotos(photos)
        } catch (error) {
            console.log('error getting blog photos ', error)
        } finally {
            setIsLoadingPhotos(false)
        }
    }

    async function updateUserAvatarHandler(imageUrl: string) {
        try {
            await updateUserAvatar(imageUrl, userId)
            setCurrentAvatar(imageUrl)
            queryClient.invalidateQueries({
                queryKey: ['getUserAvatar', userId],
            });
        } catch (error) {
            console.log('error updating url', error)
        }
    }


    const photos = [
        {
            id: 'awefasd',
            url: '/images/demo-avatars/1.png'
        },
        {
            id: 'aw323ef',
            url: '/images/demo-avatars/2.png'
        },
        {
            id: 'aw234fef',
            url: '/images/demo-avatars/3.png'
        },
        {
            id: 'aweljf',
            url: '/images/demo-avatars/4.png'
        },
        {
            id: 'awe0j3ff',
            url: '/images/demo-avatars/5.png'
        },
        {
            id: 'awec,xnf',
            url: '/images/demo-avatars/6.png'
        },
        {
            id: 'awe1209kff',
            url: '/images/demo-avatars/7.png'
        },
        {
            id: 'awsdpfo90323ref',
            url: '/images/demo-avatars/8.png'
        },
        {
            id: 'aweasdflm2eifm23f',
            url: '/images/demo-avatars/9.png'
        },
        {
            id: 'awe3iom2fmafafsadf',
            url: '/images/demo-avatars/10.png'
        },
        {
            id: 'awe23ofm23fim3fjfadf',
            url: '/images/demo-avatars/11.png'
        },
    ]

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
                                    width={1024}
                                    height={1024}
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

"use client"
import LoadingAnimation from "@/components/loading-animation";
import { getAllAvatarPhotos } from "@/lib/actions/s3-upload";
import { BlogImage } from "@/types";
import Image from "next/image";
import { useState } from "react";

export default function UpdateAvatar({
    setOpenPhotoModal
}: {
    setOpenPhotoModal: React.Dispatch<React.SetStateAction<boolean>>
}) {

    const [isLoadingPhotos, setIsLoadingPhotos] = useState<boolean>(false);
    const [allAvatarPhotos, setAllAvatarPhotos] = useState<BlogImage[] | null>(null)
    const [imageUrl, setImageUrl] = useState<string>("");


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


    const photos = [
        {
            id: 'awef',
            url: '/images/logo.png'
        }
    ]
    return (
        <form>
            <>
                {isLoadingPhotos ? (
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
                                    width={1920}
                                    height={1080}
                                    onClick={() => { setImageUrl(img.url); setOpenPhotoModal(false) }}
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

"use client"
// import LoadingAnimation from "@/components/loading-animation";
// import { getAllAvatarPhotos } from "@/lib/actions/s3-upload";
// import { BlogImage } from "@/types";
// import { useState } from "react";
// import Image from "next/image";

export default function UpdateAvatar({
    // setOpenPhotoModal
}: {
    // setOpenPhotoModal: React.Dispatch<React.SetStateAction<boolean>>
}) {

    // const [isLoadingPhotos, setIsLoadingPhotos] = useState<boolean>(false);
    // const [allAvatarPhotos, setAllAvatarPhotos] = useState<BlogImage[] | null>(null)
    // const [imageUrl, setImageUrl] = useState<string>("");


    // async function fetchPhotos() {
    //     if (allAvatarPhotos !== null) return
    //     try {
    //         setIsLoadingPhotos(true)
    //         const photos = await getAllAvatarPhotos() as BlogImage[]
    //         setAllAvatarPhotos(photos)
    //     } catch (error) {
    //         console.log('error getting blog photos ', error)
    //     } finally {
    //         setIsLoadingPhotos(false)
    //     }
    // }


    // const photos = [
    //     {
    //         id: 'awef',
    //         url: '/images/demo-avatars/1.png'
    //     },
    //     {
    //         id: 'awef',
    //         url: '/images/demo-avatars/2.png'
    //     },
    //     {
    //         id: 'awef',
    //         url: '/images/demo-avatars/3.png'
    //     },
    //     {
    //         id: 'awef',
    //         url: '/images/demo-avatars/4.png'
    //     },
    //     {
    //         id: 'awef',
    //         url: '/images/demo-avatars/5.png'
    //     },
    //     {
    //         id: 'awef',
    //         url: '/images/demo-avatars/6.png'
    //     },
    //     {
    //         id: 'awef',
    //         url: '/images/demo-avatars/7.png'
    //     },
    //     {
    //         id: 'awef',
    //         url: '/images/demo-avatars/8.png'
    //     },
    //     {
    //         id: 'awef',
    //         url: '/images/demo-avatars/9.png'
    //     },
    //     {
    //         id: 'awef',
    //         url: '/images/demo-avatars/10.png'
    //     },
    //     {
    //         id: 'awef',
    //         url: '/images/demo-avatars/11.png'
    //     },
    // ]
    return (
        <form>
            {/* <>
                {isLoadingPhotos ? (
                    <div className="flex-center h-[355px]">
                        <LoadingAnimation />
                    </div>
                ) : (
                    <>
                        <div className="h-[355px] mx-auto overflow-y-auto flex-center flex-wrap gap-3 custom-scrollbar">
                            {photos && photos.map((img) => (
                                <Image
                                    key={img.id}
                                    src={img.url}
                                    alt="blog cover photo"
                                    width={1024}
                                    height={1024}
                                    // onClick={() => { setImageUrl(img.url); setOpenPhotoModal(false) }}
                                    className="hover:cursor-pointer hover:scale-105 rounded-full w-[80px] h-[80px]"
                                />
                            ))}
                        </div>
                    </>
                )}
            </> */}
            <p>hi</p>
        </form>
    )
}

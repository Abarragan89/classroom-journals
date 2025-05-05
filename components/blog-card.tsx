import Image from "next/image";
import { FaRegHeart } from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";

interface Props {
    title?: string;
    description?: string;
    date?: string;
    likeCount: number;
    coverPhotoUrl?: string;
    totalCommentCount: number;
    author: string;
}

export default function BlogCard({
    title,
    description,
    // date,
    likeCount,
    coverPhotoUrl,
    totalCommentCount,
    author
}: Props) {

    return (
        <div className="embla__slide-inner flex-col h-full w-[300px] border pb-2 rounded-sm hover:cursor-pointer relative">
            {/* Your slide content here */}
            <Image
                src={coverPhotoUrl ? coverPhotoUrl : "https://unfinished-pages.s3.us-east-2.amazonaws.com/fillerImg.png"}
                width={320}
                height={180}
                alt="Busts of Greek philosophers"
                className="rounded-t-sm w-[320px] h-[180px]"
            />
            <div className="min-h-[200px]">
                <div className="flex justify-between px-2 pt-1 text-input text-[0.875rem]">
                    <p>{author}</p>
                    <div className="flex">
                        <div className="flex items-center pr-3">
                            <FaRegHeart />
                            <p className="ml-1">{likeCount}</p>
                        </div>
                        <div className="flex items-center">
                            <FiMessageCircle />
                            <p className=" ml-1">{totalCommentCount}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col justify-between h-[180px]">
                    <div className="flex-column justify-between rounded-b-sm pt-1 px-3">
                        <h3 className="text-primary text-[1.1rem] leading-tight font-bold">{title}</h3>
                        <p className="mt-1 text-[.95rem] text-ring line-clamp-3">{description}</p>
                    </div>
                    {/* <div className="flex justify-between">
                        <div className="flex justify-end px-2 text-input text-[0.875rem]">
                            <p className="text-[.875rem] text-input">{date}</p>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    )
}

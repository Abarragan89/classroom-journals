import Image from "next/image";
import { FaRegHeart } from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";

interface Props {
    title?: string;
    description?: string;
    likeCount: number;
    date: string;
    coverPhotoUrl?: string;
    totalCommentCount: number;
    author: string;
}

export default function BlogCard({
    title,
    description,
    likeCount,
    coverPhotoUrl,
    totalCommentCount,
    date,
    author
}: Props) {

    return (
        <div className="embla__slide-inner flex-col h-full w-[300px] relative rounded-md">
            {/* Your slide content here */}
            <Image
                src={coverPhotoUrl ? coverPhotoUrl : "https://unfinished-pages.s3.us-east-2.amazonaws.com/fillerImg.png"}
                width={298}
                height={167}
                alt={title ? `Cover image for ${title}` : "Blog post cover image"}
                className="rounded-t-[5px] w-full"
                priority={true}
                loading="eager"
                fetchPriority="high"
                sizes="298px"
                quality={75}
            />
            <div className="min-h-[200px] px-2 bg-card rounded-b-md">
                <div className="flex justify-between pt-1 text-muted-foreground text-[0.875rem]">
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
                <div className="flex flex-col justify-between h-[180px] ">
                    <div className="flex-column justify-between   pt-2">
                        <h3 className="text-primary text-[1.15rem] leading-tight font-bold">{title}</h3>
                        <p className="mt-1 text-[.925rem] font-medium line-clamp-3">{description}</p>
                    </div>
                    <div className="flex justify-between ">
                        <div className="flex justify-end text-[0.8rem] pb-1">
                            <p className="text-[.85rem] text-muted-foreground">{date}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

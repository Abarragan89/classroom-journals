import Link from "next/link"
import Image from "next/image"
import { APP_NAME } from "@/lib/constants"
import Menu from "./menu"
import { Session } from "@/types"
import BlogPageHeader from "./blog-page-header"

export default function zHeader({
    teacherId,
    session,
    studentId,
    isAllowedToMakeNewClass,
    isInBlogPage = false
}: {
    teacherId?: string;
    studentId?: string;
    session?: Session;
    isAllowedToMakeNewClass?: boolean;
    isInBlogPage?: boolean;
}) {

    if (isInBlogPage) return <BlogPageHeader />

    return (
        <header className='w-full border-b print:hidden '>
            <div className="py-3 px-5  flex-between relative  max-w-7xl lg:mx-auto ">
                <div className="flex-start">
                    <Link
                        href='/'
                        className='flex-start'>
                        <Image
                            src='/images/logo-v3.png'
                            alt={`${APP_NAME} logo`}
                            height={77}
                            width={77}
                            priority
                        />
                    </Link>
                </div>
                <Menu
                    teacherId={teacherId}
                    studentId={studentId}
                    session={session as Session}
                    isAllowedToMakeNewClass={isAllowedToMakeNewClass as boolean}
                />
                {session?.user?.username && !session?.user?.email && (
                    <p className="block text-xs absolute bottom-0 right-5 whitespace-nowrap"
                    >
                        Hi, {session?.user?.username}
                    </p>
                )}
            </div>
        </header>
    )
}

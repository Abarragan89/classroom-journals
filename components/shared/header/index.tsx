import Link from "next/link"
import Image from "next/image"
import { APP_NAME } from "@/lib/constants"
import Menu from "./menu"
import { Session } from "@/types"

export default function Header({
    teacherId,
    session,
    studentId,
    isAllowedToMakeNewClass,
}: {
    teacherId?: string;
    studentId?: string;
    session?: Session;
    isAllowedToMakeNewClass?: boolean;

}) {

    return (
        <header className='w-full border-b print:hidden '>
            <div className="py-3 px-5  flex-between relative  max-w-7xl lg:mx-auto ">
                <div className="flex-start">
                    <Link
                        href='/'
                        className='flex-start'>
                        <Image
                            src='/images/logo-v2.png'
                            alt={`${APP_NAME} logo`}
                            height={60}
                            width={60}
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

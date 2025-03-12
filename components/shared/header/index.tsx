import Link from "next/link"
import Image from "next/image"
import { APP_NAME } from "@/lib/constants"
import Menu from "./menu"
import { Session } from "@/types"

export default function Header({
    teacherId,
    session,
}: {
    teacherId?: string
    session?: Session
}) {

    return (
        <header className='w-full border-b'>
            <div className="py-3 px-5  flex-between">
                <div className="flex-start">
                    <Link
                        href='/'
                        className='flex-start'>
                        <Image
                            src='/images/logo.png'
                            alt={`${APP_NAME} logo`}
                            height={50}
                            width={50}
                            priority={true}
                            className="rounded-2xl"
                        />
                    </Link>
                </div>
                <Menu
                    teacherId={teacherId}
                    session={session as Session}
                />
            </div>
        </header>
    )
}

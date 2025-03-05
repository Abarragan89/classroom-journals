import Link from "next/link"
import Image from "next/image"
import { APP_NAME } from "@/lib/constants"
import Menu from "./menu"

export default function Header({
    teacherId
}: {
    teacherId?: string
}) {
    return (
        <header className='w-full border-b'>
            <div className="wrapper flex-between">
                <div className="flex-start">
                    <Link
                        href='/'
                        className='flex-start'>
                        <Image
                            src='/images/logo.png'
                            alt={`${APP_NAME} logo`}
                            height={55}
                            width={55}
                            priority={true}
                            className="rounded-2xl"
                        />
                        {/* <span className="hidden lg:block font-bold text-2xl ml-3">
                            {APP_NAME}
                        </span> */}
                    </Link>
                </div>
                <Menu
                    teacherId={teacherId}
                />
            </div>
        </header>
    )
}

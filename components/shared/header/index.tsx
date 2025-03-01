import Link from "next/link"
import Image from "next/image"
import { APP_NAME } from "@/lib/constants"
import Menu from "./menu"

export default function Header({
    teacherId,
    inClassroom,
    classId
}: {
    teacherId?: string,
    inClassroom?: boolean
    classId?: string
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
                            height={50}
                            width={50}
                            priority={true}
                            className="rounded-lg"
                        />
                        <span className="hidden lg:block font-bold text-2xl ml-3">
                            {APP_NAME}
                        </span>
                    </Link>
                </div>
                <Menu
                    teacherId={teacherId}
                    inClassroom={inClassroom}
                    classId={classId}
                />
            </div>
        </header>
    )
}

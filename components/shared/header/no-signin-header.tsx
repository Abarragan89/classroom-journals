import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import ModeToggle from "./mode-toggle";

export default function NoSignInHeader() {
    return (
        <header className='w-full border-b print:hidden'>
            <div className="py-3 px-5 flex-between max-w-7xl lg:mx-auto">
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
                <ModeToggle />
            </div>
        </header>
    )
}

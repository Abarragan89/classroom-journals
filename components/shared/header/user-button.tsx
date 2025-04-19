import Link from "next/link"
import { signOutUser } from "@/lib/actions/auth.action"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { LogOut, User, UserIcon } from "lucide-react";
import Image from "next/image";
import { Session } from "@/types";

export default async function UserButton({
    session
}: {
    session?: Session
}) {

    if (!session) {
        return (
            <Button asChild>
                <Link href='/sign-in'>
                    <UserIcon /> Sign In
                </Link>
            </Button>
        )
    }

    const firstInitial = session?.user?.username?.charAt(0).toUpperCase() ?? 'U'

    return (
        <div className="flex gap-2 items-center">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center">
                        {session?.user?.image ?
                            <Button className="flex items-center justify-center ml-2 bg-transparent px-0 shadow-none">
                                <Image
                                    className="rounded-full"
                                    src={session.user.image}
                                    alt="user profile image"
                                    width={30}
                                    height={30}
                                />
                            </Button>
                            :
                            <Button className="relative w-8 h-8 rounded-full ml-2 flex items-center justify-center">
                                {firstInitial}
                            </Button>
                        }
                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <div className="text-sm text-center text-ring font-medium leading-none">
                                {session?.user?.email ?? session?.user?.username}
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    {session.user.role === 'teacher' &&
                        <DropdownMenuLabel className="p-0 mb-1">
                            <Button asChild className="w-full py-4 px-2 h-4 justify-start" variant='ghost'>
                                <Link
                                    href='/teacher-account'
                                    className="flex-start"
                                >
                                    <User size={18} /> Account
                                </Link>
                            </Button>
                        </DropdownMenuLabel>
                    }
                    <DropdownMenuItem className="p-0 mb-1">
                        <form action={signOutUser} className="w-full">
                            <Button className="w-full py-4 px-2 h-4 justify-start" variant='ghost'>
                                <LogOut /> Sign out
                            </Button>
                        </form>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

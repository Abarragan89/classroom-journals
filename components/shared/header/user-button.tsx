"use client"
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
import { LogOut, User } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function UserButton() {
    const { data: session } = useSession();

    if (!session?.user) return null;

    return (
        <div className="relative">
            <div className="flex gap-2 items-center relative">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center">
                            <Button className="flex items-center justify-center ml-2 bg-transparent px-0 shadow-none">
                                <Image
                                    src={session?.user?.avatarURL || '/images/demo-avatars/1.png'}
                                    alt="blog cover photo"
                                    width={36}
                                    height={36}
                                    className="rounded-full w-[36px] h-[36px]"
                                />
                            </Button>
                        </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-fit max-w-[300px] px-5" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <div className="text-xs text-center font-medium leading-none line-clamp-1">
                                    {session?.user?.email ?? session?.user?.username}
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        {session.user.role === 'TEACHER' &&
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

            {session?.user?.username && (
                <p className="hidden md:block text-xs text-accent absolute top-11 right-0 whitespace-nowrap"
                >
                    Hi, {session?.user?.username}
                </p>
            )}
        </div>
    )
}

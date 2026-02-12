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
import { Separator } from "@/components/ui/separator";

export default function UserButton({ isMobile = false, onNavigate }: { isMobile?: boolean; onNavigate?: () => void }) {
    const { data: session } = useSession();
    if (!session?.user) return null;

    if (isMobile) {
        return (
            <div className="w-full flex flex-col gap-1 mt-4">
                <Separator className="mb-2" />
                <div className="px-4 py-2 text-xs text-muted-foreground">
                    {session?.user?.name ?? session?.user?.email}
                </div>
                {session.user.role === 'TEACHER' && (
                    <Button
                        asChild
                        variant="ghost"
                        className="w-full justify-start gap-3 px-4 py-3 h-auto text-sm font-normal rounded-md hover:bg-accent text-muted-foreground"
                    >
                        <Link href='/teacher-account' onClick={onNavigate}>
                            <User size={18} />
                            <span>Account</span>
                        </Link>
                    </Button>
                )}
                <form action={signOutUser} className="w-full">
                    <Button
                        className="w-full justify-start gap-3 px-4 py-3 h-auto text-sm font-normal rounded-md hover:bg-accent text-muted-foreground"
                        variant='ghost'
                    >
                        <LogOut size={18} />
                        <span>Sign out</span>
                    </Button>
                </form>
            </div>
        )
    }

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
                                    className="rounded-full w-[36px] h-[36px] border"
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
        </div>
    )
}

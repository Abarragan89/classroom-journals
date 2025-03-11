"use client"
import { ChevronsUpDown, GalleryVerticalEnd } from "lucide-react"
import { usePathname } from "next/navigation"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Classroom } from "@/types"
import Link from "next/link"

export function ClassroomSwitcher({
    classrooms,
}: {
    classrooms: Classroom[]
}) {

    const pathname = usePathname();
    const currentClassroomId = pathname.split("/")[2];
    const selectedClassroom = classrooms.find(c => c.id === currentClassroomId) || classrooms[0];

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <GalleryVerticalEnd className="size-4" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-semibold">Classes</span>
                                <span className="line-clamp-1">{selectedClassroom.name}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width]"
                        align="start"
                    >
                        {classrooms?.map((classroom) => (
                            <DropdownMenuItem
                                key={classroom.id}
                            >
                                <Link href={`/classroom/${classroom.id}`} className="w-full block">
                                    {classroom.name}
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

'use client'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar"

import Link from "next/link"
import { PromptSession } from "@/types"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { User } from "lucide-react"

export function DiscussionSidebar({ ...props }: React.ComponentProps<typeof Sidebar> & { prompt_data: PromptSession }) {

    const pathname = usePathname();
    const sessionId = pathname.split("/")[2];

    const [responses, setResponses] = useState(props?.prompt_data?.responses)
    const [currentResponseId, setCurrentResponseId] = useState<string>('')

    useEffect(() => {
        if (props?.prompt_data?.responses && props?.prompt_data?.responses !== responses) {
            setResponses(props?.prompt_data?.responses);
        }
        setCurrentResponseId(pathname?.split("/")[4])
    }, [props?.prompt_data?.responses, pathname])

    const data = {
        navMain: [
            {
                title: "Menu",
                items: [
                    { title: "Assignments", icon: User, slug: `/discussion-board/${sessionId}/response/` },
                    { title: "Roster", icon: User, slug: `/discussion-board/${sessionId}/response/` },
                    { title: "Jots", icon: User, slug: `/discussion-board/${sessionId}/response/` },
                    { title: "Notifications", icon: User, slug: `/discussion-board/${sessionId}/response/` },
                    { title: "Student Requests", icon: User, slug: `/discussion-board/${sessionId}/response/` },
                    { title: "Class Settings", icon: User, slug: `/discussion-board/${sessionId}/response/` },
                ],
            },
        ]
    }

    // { title: "Class Settings", icon: User, slug: `/discussion-board/${sessionId}/response/`, isActive: response.id === responseId, isLink: true },

    return (
        <Sidebar
            collapsible='icon'
            {...props}>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="opacity-70">Bloggers</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {responses && responses?.map((response) => {
                                return (
                                    <SidebarMenuItem key={response.id}>
                                        {/* <Link href={`/discussion-board/${sessionId}/response/${response.id}`}> */}
                                        <SidebarMenuButton isActive={currentResponseId === response.id}>
                                            <Link href={`${response.id}`} className="flex items-center gap-2">
                                                {/* {<User size={18} />} */}
                                                <p className="text-xl w-10">{response?.student?.username?.charAt(0)}</p>
                                                {response?.student?.username}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarSeparator />
            </SidebarContent>
            <SidebarRail />
        </Sidebar >
    )
}

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
import { PromptSession, User } from "@/types"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function DiscussionSidebar({ ...props }: React.ComponentProps<typeof Sidebar> & { prompt_data: PromptSession }) {

    const pathname = usePathname();
    const studentId = pathname.split("/")[2];
    const sessionId = pathname.split("/")[3];

    const [responses, setResponses] = useState(props?.prompt_data?.responses)

    useEffect(() => {
        if (props?.prompt_data?.responses && props?.prompt_data?.responses !== responses) {
            setResponses(props?.prompt_data?.responses);
        }
    }, [props?.prompt_data?.responses, pathname])

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
                                console.log('response, ', response)
                                return (
                                    <SidebarMenuItem key={response.id}>
                                        <Link href={`/discussion-board/${studentId}/${sessionId}/response/${response.id}`}>
                                            <SidebarMenuButton>
                                                {response.student.username}
                                            </SidebarMenuButton>
                                        </Link>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarSeparator />
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}

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
import { Heart, MessageCircle } from "lucide-react"

export function DiscussionSidebar({ ...props }: React.ComponentProps<typeof Sidebar> & { prompt_data: PromptSession }) {

    const pathname = usePathname();
    const [responses, setResponses] = useState(props?.prompt_data?.responses)
    const [currentResponseId, setCurrentResponseId] = useState<string>('')

    useEffect(() => {
        if (props?.prompt_data?.responses && props?.prompt_data?.responses !== responses) {
            setResponses(props?.prompt_data?.responses);
        }
        setCurrentResponseId(pathname?.split("/")[4])
    }, [props?.prompt_data?.responses, pathname])

    return (
        <Sidebar
            collapsible='offcanvas'
            {...props}>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="opacity-70">Bloggers</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {responses && responses?.sort((a, b) => b.likeCount - a.likeCount)?.map((response) => {
                                return (
                                    <div key={response.id}>
                                        <SidebarMenuItem>
                                            <Link href={`${response.id}`} className="flex items-center gap-2 text-sidebar-accent-foreground">
                                                <SidebarMenuButton isActive={currentResponseId === response.id}>
                                                    <span className="flex justify-between items-center gap-2">
                                                        {response?.student?.username}
                                                        <div className="flex items-baseline justify-between text-xs text-input space-x-2">
                                                            <span className="flex">{response?.likeCount} <Heart className="ml-1" size={15} /></span>
                                                            <span className="flex">{response?._count?.comments} <MessageCircle className="ml-1" size={13} /></span>
                                                        </div>
                                                    </span>
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                    </div>
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

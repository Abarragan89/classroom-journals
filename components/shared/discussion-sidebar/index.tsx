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

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import Link from "next/link"
import { PromptSession } from "@/types"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

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
            collapsible='icon'
            {...props}>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="opacity-70">Bloggers</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {responses && responses?.map((response) => {
                                return (
                                    <div key={response.id}>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <SidebarMenuItem>
                                                        <SidebarMenuButton isActive={currentResponseId === response.id}>
                                                            <Link href={`${response.id}`} className="flex items-center gap-2 text-sidebar-accent-foreground">
                                                                <p className="text-xl w-7 border-r border-input mr-3">{response?.student?.username?.charAt(0)}</p>
                                                                {response?.student?.username}
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{response?.student?.username}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
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

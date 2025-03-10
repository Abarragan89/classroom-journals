'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { ClassroomSwitcher } from "./classroom-switcher"
import Link from "next/link"
import { Classroom } from "@/types"
import { usePathname } from "next/navigation"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar> & { classes: Classroom[] }) {

  console.log('propt ', props.classes)
  const pathname = usePathname();
  const currentClassroomId = pathname.split("/")[2];
  const currentRoute = pathname.split("/")[3];
  const selectedClassroom = props?.classes?.find(c => c.id === currentClassroomId) || props.classes[0];


  console.log('currentroute ', currentRoute)
  const data = {
    navMain: [
      {
        title: "Menu",
        items: [
          { title: "Assignment", slug: `/classroom/${currentClassroomId}`, isActive: currentRoute === undefined, isLink: true },
          { title: "Roster", slug: `/classroom/${currentClassroomId}/roster`, isActive: currentRoute === 'roster', isLink: true },
          { title: "Jots", slug: `/classroom/${currentClassroomId}/jots`, isActive: currentRoute === 'jots', isLink: true },
          { title: "Notifications", slug: `/classroom/${currentClassroomId}/notifications`, isActive: currentRoute === 'notifications', isLink: true },
          { title: "Settings", slug: `/classroom/${currentClassroomId}/settings`, isActive: currentRoute === 'settings', isLink: true },
        ],
      },
    ]
  }

  return (
    <Sidebar
      collapsible='icon'
      {...props}>
      <SidebarHeader>
        <ClassroomSwitcher
          classrooms={props.classes}
        />
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel className="opacity-70">{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.isLink ?
                      <SidebarMenuButton asChild isActive={item.isActive}>
                        <Link href={`${item.slug}`}>
                          {item.title}
                        </Link>
                      </SidebarMenuButton>
                      :
                      <p className="ml-2">
                        {item.title}
                      </p>
                    }
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarSeparator />
        <SidebarGroupLabel className="text-sm ml-2">ClassCode: <span className="ml-2 bg-accent py-1 px-2 rounded-full">{selectedClassroom.classCode}</span></SidebarGroupLabel>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

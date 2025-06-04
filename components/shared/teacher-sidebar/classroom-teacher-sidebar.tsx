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
  useSidebar,
} from "@/components/ui/sidebar"
import { ClassroomSwitcher } from "./classroom-switcher"
import Link from "next/link"
import { Classroom } from "@/types"
import { usePathname } from "next/navigation"
import {
  Home, User, Keyboard, Bell, Settings, PenTool,
  //  Table, 
  MessageCircle,
  Inbox
} from "lucide-react"
import { getUnreadUserNotifications } from "@/lib/actions/notifications.action"
import { getStudentRequestCount } from "@/lib/actions/student-request"
import { useQuery } from "@tanstack/react-query"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar> & { classes: Classroom[] }) {

  const pathname = usePathname();
  const currentClassroomId = pathname.split("/")[2];
  const teacherId = pathname.split("/")[3];
  const currentRoute = pathname.split("/")[4];
  const selectedClassroom = props?.classes?.find(c => c.id === currentClassroomId) || props.classes[0];

  const { setOpenMobile } = useSidebar();

  const { data: notificationCount } = useQuery({
    queryKey: ['getUserNotifications', teacherId],
    queryFn: () => getUnreadUserNotifications(teacherId, currentClassroomId) as unknown as number,
    // refetchOnMount: false,
    refetchOnReconnect: false,
    // refetchOnWindowFocus: false,
    // staleTime: Infinity,
  })

  const { data: studentRequestCount } = useQuery({
    queryKey: ['getStudentRequestCount', teacherId],
    queryFn: () => getStudentRequestCount(teacherId, currentClassroomId) as unknown as number,
    // refetchOnMount: false,
    refetchOnReconnect: false,
    // refetchOnWindowFocus: false,
    // staleTime: Infinity,
  })


  const data = {
    navMain: [
      {
        title: "Menu",
        items: [
          { title: "Assignments", icon: Home, slug: `/classroom/${currentClassroomId}/${teacherId}`, isActive: currentRoute === undefined, isLink: true },
          { title: "Roster", icon: User, slug: `/classroom/${currentClassroomId}/${teacherId}/roster`, isActive: currentRoute === 'roster', isLink: true },
          { title: "Jots", icon: PenTool, slug: `/classroom/${currentClassroomId}/${teacherId}/jots`, isActive: currentRoute === 'jots', isLink: true },
          { title: "Quips", icon: MessageCircle, slug: `/classroom/${currentClassroomId}/${teacherId}/quips`, isActive: currentRoute === 'quips', isLink: true },
          { title: "Notifications", icon: Bell, slug: `/classroom/${currentClassroomId}/${teacherId}/notifications`, isActive: currentRoute === 'notifications', isLink: true },
          // { title: "Score Sheet", icon: Table, slug: `/classroom/${currentClassroomId}/${teacherId}/scoresheet`, isActive: currentRoute === 'scoresheet', isLink: true },
          { title: "Typing Test", icon: Keyboard, slug: `/classroom/${currentClassroomId}/${teacherId}/typing-test`, isActive: currentRoute === 'typing-test', isLink: true },
          { title: "Student Requests", icon: Inbox, slug: `/classroom/${currentClassroomId}/${teacherId}/student-requests`, isActive: currentRoute === 'student-requests', isLink: true },
          { title: "Class Settings", icon: Settings, slug: `/classroom/${currentClassroomId}/${teacherId}/settings`, isActive: currentRoute === 'settings', isLink: true },
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
                {item.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.title}>
                      {item.isLink ? (
                        <SidebarMenuButton asChild isActive={item.isActive}>
                          <Link href={`${item.slug}`} className="flex items-center gap-2" onClick={() => setOpenMobile(false)}>
                            {Icon && <Icon size={18} />}
                            {item.title}
                            {/* Show notification count if notifications exists */}
                            {item.title === 'Notifications' && notificationCount !== undefined && notificationCount > 0 && (
                              <p
                                className="text-center min-w-6 p-[3px] rounded-full text-xs bg-destructive text-destructive-foreground"
                              >
                                {notificationCount}
                              </p>
                            )}
                            {/* Show requests count if exists */}
                            {item.title === 'Student Requests' && studentRequestCount !== undefined && studentRequestCount > 0 && (
                              <p
                                className="text-center min-w-6 p-[3px] rounded-full text-xs bg-destructive text-destructive-foreground"
                              >
                                {studentRequestCount}
                              </p>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      ) : (
                        <p className="ml-2 flex items-center gap-2">
                          {Icon && <Icon size={18} />}
                          {item.title}
                        </p>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarSeparator />
        <SidebarGroupLabel className="text-sm ml-2">Class Code: <span className="ml-2 bg-accent text-accent-foreground py-1 px-2 rounded-full">{selectedClassroom.classCode}</span></SidebarGroupLabel>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

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
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Home, User, FileText, Bell, ClipboardList, Settings } from "lucide-react"
import { getUnreadUserNotifications } from "@/lib/actions/notifications.action"
import { getStudentRequestCount } from "@/lib/actions/student-request"
// import { listS3Urls } from "@/lib/actions/s3.download.action"
// import { Button } from "@/components/ui/button"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar> & { classes: Classroom[] }) {

  const pathname = usePathname();
  const currentClassroomId = pathname.split("/")[2];
  const teacherId = pathname.split("/")[3];
  const currentRoute = pathname.split("/")[4];
  const selectedClassroom = props?.classes?.find(c => c.id === currentClassroomId) || props.classes[0];
  const [notificationCount, setNotificationCount] = useState<number>(0)
  const [studentRequestCount, setStudentRequestCount] = useState<number>(0)

  useEffect(() => {
    async function getNotifications() {
      if (teacherId) {
        const newNotificaitonCount = await getUnreadUserNotifications(teacherId)
        setNotificationCount(newNotificaitonCount as number)

        const studentRequests = await getStudentRequestCount(teacherId)
        setStudentRequestCount(studentRequests as number)
      }
    }
    getNotifications();
  }, [teacherId, pathname])

  const data = {
    navMain: [
      {
        title: "Menu",
        items: [
          { title: "Assignments", icon: Home, slug: `/classroom/${currentClassroomId}/${teacherId}`, isActive: currentRoute === undefined, isLink: true },
          { title: "Roster", icon: User, slug: `/classroom/${currentClassroomId}/${teacherId}/roster`, isActive: currentRoute === 'roster', isLink: true },
          { title: "Jots", icon: FileText, slug: `/classroom/${currentClassroomId}/${teacherId}/jots`, isActive: currentRoute === 'jots', isLink: true },
          { title: "Notifications", icon: Bell, slug: `/classroom/${currentClassroomId}/${teacherId}/notifications`, isActive: currentRoute === 'notifications', isLink: true },
          { title: "Student Requests", icon: ClipboardList, slug: `/classroom/${currentClassroomId}/${teacherId}/student-requests`, isActive: currentRoute === 'student-request', isLink: true },
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

                {/* GET S3 BUCKET URLS BUTTON */}
                {/* <Button onClick={listS3Urls}>GetUrls</Button> */}
                {/* <Button onClick={getBedtimeStory}>TriggerChatGPT</Button> */}

                {item.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.title}>
                      {item.isLink ? (
                        <SidebarMenuButton asChild isActive={item.isActive}>
                          <Link href={`${item.slug}`} className="flex items-center gap-2">
                            {Icon && <Icon size={18} />}
                            {item.title}
                            {/* Show notification count if notifications exists */}
                            {item.title === 'Notifications' && notificationCount > 0 && (
                              <p
                                className="text-center min-w-6 p-[3px] rounded-full text-xs bg-destructive text-destructive-foreground"
                              >
                                {notificationCount}
                              </p>
                            )
                            }
                            {/* Show requests count if exists */}
                            {item.title === 'Student Requests' && studentRequestCount > 0 && (
                              <p
                                className="text-center min-w-6 p-[3px] rounded-full text-xs bg-destructive text-destructive-foreground"
                              >
                                {studentRequestCount}
                              </p>
                            )
                            }
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

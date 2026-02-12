"use client"
import { useState } from "react";
import ModeToggle from "./mode-toggle"
import UserButton from "./user-button"
import { MenuIcon, UserIcon } from "lucide-react";
import {
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
    Sheet
} from "@/components/ui/sheet";
import ActionSubMenu from "./action-sub-menu";
import StudentNavLinks from "./student-nav-links";
import TeacherNavLinks from "./teacher-nav-links";
import { Separator } from "@/components/ui/separator";
import { Session } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Menu({
    teacherId,
    session,
    studentId,
    isAllowedToMakeNewClass,
}: {
    teacherId?: string,
    studentId?: string,
    session: Session
    isAllowedToMakeNewClass: boolean;
}) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const closeSheet = () => {
        setIsSheetOpen(false);
    };

    const renderTeacherHeader = (isMobile = false) => (
        <>
            <TeacherNavLinks isMobile={isMobile} onNavigate={isMobile ? closeSheet : undefined} />

            <ActionSubMenu
                teacherId={teacherId as string}
                session={session as Session}
                isAllowedToMakeNewClass={isAllowedToMakeNewClass as boolean}
                isMobile={isMobile}
            />

            <ModeToggle isMobile={isMobile} />
            <UserButton isMobile={isMobile} onNavigate={isMobile ? closeSheet : undefined} />
        </>
    );
    const renderStudentHeader = (isMobile = false) => (
        <>
            <StudentNavLinks studentId={studentId as string} classId={session?.classroomId as string} isMobile={isMobile} onNavigate={isMobile ? closeSheet : undefined} />
            <ModeToggle isMobile={isMobile} />
            <UserButton isMobile={isMobile} onNavigate={isMobile ? closeSheet : undefined} />
        </>
    );

    const renderGuestMenu = (isMobile = false) => (
        <>
            <ModeToggle isMobile={isMobile} />
            <Button asChild className={isMobile ? "w-full justify-start" : ""}>
                <Link href='/sign-in' className="flex gap-x-2" onClick={isMobile ? closeSheet : undefined}>
                    <UserIcon /> Sign In
                </Link>
            </Button>
        </>
    );

    const renderMenuOptions = (isMobile = false) => {
        if (teacherId) {
            return renderTeacherHeader(isMobile)
        } else if (studentId) {
            return renderStudentHeader(isMobile);
        } else {
            return renderGuestMenu(isMobile);
        }
    };

    return (
        <div className="flex justify-end gap-3">
            <nav className="hidden sm:flex-center w-full max-w-md gap-3">
                {renderMenuOptions()}
            </nav>

            {/* Sheet Menu for Mobile View */}
            <nav className="sm:hidden">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger className="align-middle">
                        <MenuIcon />
                    </SheetTrigger>
                    <SheetContent className="flex flex-col items-start w-[280px]">
                        <SheetTitle>Menu</SheetTitle>
                        <Separator />
                        <div className="w-full flex flex-col gap-1 mt-4">
                            {renderMenuOptions(true)}
                        </div>
                        <SheetDescription></SheetDescription>
                    </SheetContent>
                </Sheet>
            </nav>
        </div>
    )
}

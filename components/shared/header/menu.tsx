import ModeToggle from "./mode-toggle"
import UserButton from "./user-button"
import { EllipsisVertical, UserIcon } from "lucide-react";
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
    const renderTeacherHeader = () => (
        <>
            <TeacherNavLinks />
            <ActionSubMenu
                teacherId={teacherId as string}
                session={session as Session}
                isAllowedToMakeNewClass={isAllowedToMakeNewClass as boolean}
            />
            <ModeToggle />
            <UserButton session={session as Session} />
        </>
    );
    const renderStudentHeader = () => (
        <>
            <StudentNavLinks studentId={studentId as string} classId={session?.classroomId as string} />
            <ModeToggle />
            <UserButton session={session as Session} />
        </>
    );

    const renderGuestMenu = () => (
        <>
            <ModeToggle />
            <Button asChild>
                <Link href='/sign-in' className="flex gap-x-2">
                    <UserIcon /> Sign In
                </Link>
            </Button>
        </>
    );

    const renderMenuOptions = () => {
        if (teacherId) {
            return renderTeacherHeader()
        } else if (studentId) {
            return renderStudentHeader();
        } else {
            console.log('hey hter ')
            return renderGuestMenu();
        }
    };

    return (
        <div className="flex justify-end gap-3">
            <nav className="hidden sm:flex-center w-full max-w-md gap-3">
                {renderMenuOptions()}
            </nav>

            {/* Sheet menu */}
            <nav className="sm:hidden">
                <Sheet>
                    <SheetTrigger className="align-middle">
                        <EllipsisVertical />
                    </SheetTrigger>
                    <SheetContent className="flex flex-col items-start">
                        <SheetTitle>Menu</SheetTitle>
                        <Separator />
                        {renderMenuOptions()}
                        <SheetDescription></SheetDescription>
                    </SheetContent>
                </Sheet>
            </nav>
        </div>
    )
}

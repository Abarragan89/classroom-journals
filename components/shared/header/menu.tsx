import ModeToggle from "./mode-toggle"
import UserButton from "./user-button"
import { EllipsisVertical } from "lucide-react";
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

export default function Menu({
    teacherId,
    session,
    studentId,
    isAllowedToMakeNewClass,
    isAllowedToMakePrompt
}: {
    teacherId?: string,
    studentId?: string,
    session: Session
    isAllowedToMakeNewClass: boolean;
    isAllowedToMakePrompt: boolean
}) {

    const renderTeacherHeader = () => (
        <>
            <TeacherNavLinks />
            <ActionSubMenu
                teacherId={teacherId as string}
                session={session as Session}
                isAllowedToMakeNewClass={isAllowedToMakeNewClass as boolean}
                isAllowedToMakePrompt={isAllowedToMakePrompt as boolean}
            />
            <ModeToggle />
            <UserButton session={session as Session} />
        </>
    );
    const renderStudentHeader = () => (
        <>
            <StudentNavLinks studentId={studentId as string} />
            <ModeToggle />
            <UserButton session={session as Session} />
        </>
    );

    const renderGuestMenu = () => (
        <>
            <ModeToggle />
            <UserButton session={session as Session} />
        </>
    );

    const renderMenuOptions = () => {
        if (teacherId) {
            return renderTeacherHeader()
        } else if (studentId) {
            return renderStudentHeader();
        } else {
            return renderGuestMenu();
        }
    };

    return (
        <div className="flex justify-end gap-3">
            <nav className="hidden sm:flex-center w-full max-w-md gap-5">
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

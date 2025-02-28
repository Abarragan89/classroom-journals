import ModeToggle from "./mode-toggle"
import UserButton from "./user-button"
import { EllipsisVertical } from "lucide-react";
import AddPromptBtn from "@/components/forms/add-prompt-btn";
import {
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
    Sheet
} from "@/components/ui/sheet";
import AddClassBtn from "@/components/forms/add-class-btn";

export default function Menu({ teacherId, inClassroom }: { teacherId?: string, inClassroom?: boolean }) {

    // Define the menu items for different conditions
    const renderClassroomMenu = () => (
        <>
            <AddPromptBtn teacherId={teacherId!} />
            <ModeToggle />
            <UserButton />
        </>
    );

    const renderDashboardMenu = () => (
        <>
            <AddClassBtn teacherId={teacherId!} />
            <ModeToggle />
            <UserButton />
        </>
    );

    const renderGuestMenu = () => (
        <>
            <ModeToggle />
            <UserButton />
        </>
    );

    const renderMenuOptions = () => {
        if (teacherId) {
            return inClassroom ? renderClassroomMenu() : renderDashboardMenu();
        } else {
            return renderGuestMenu();
        }
    };

    return (
        <div className="flex justify-end gap-3">
            <nav className="hidden md:flex-center w-full max-w-xs gap-5">
                {renderMenuOptions()}
            </nav>

            {/* Sheet menu */}
            <nav className="md:hidden">
                <Sheet>
                    <SheetTrigger className="align-middle">
                        <EllipsisVertical />
                    </SheetTrigger>
                    <SheetContent className="flex flex-col items-start">
                        <SheetTitle>Menu</SheetTitle>
                        {renderMenuOptions()}
                        <SheetDescription></SheetDescription>
                    </SheetContent>
                </Sheet>
            </nav>
        </div>
    )
}

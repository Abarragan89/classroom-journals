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
import AddClassBtn from "@/components/forms/add-class-btn";

export default function Menu({ teacherId, inClassroom }: { teacherId?: string, inClassroom?: boolean }) {

    function MenuOptions() {
        if (teacherId) {
            if (inClassroom) {
                // Show this in header if they are in classroom
                return (
                    <>
                        <p>My Posts</p>
                        <ModeToggle />
                        <UserButton />
                    </>
                )
            } else {
                // Show this if they are in dashboard
                return (
                    <>
                        <AddClassBtn teacherId={teacherId} />
                        <ModeToggle />
                        <UserButton />
                    </>
                )
            }
        } else {
            // Show these options if they are not signed in
            return (
                <>
                    <ModeToggle />
                    <UserButton />
                </>
            )
        }
    }

    return (
        <div className="flex justify-end gap-3">
            <nav className="hidden md:flex-center w-full max-w-xs gap-5">
                <MenuOptions />
            </nav>

            {/* Sheet menu */}
            <nav className="md:hidden">
                <Sheet>
                    <SheetTrigger className="align-middle">
                        <EllipsisVertical />
                    </SheetTrigger>
                    <SheetContent className="flex flex-col items-start">
                        <SheetTitle>Menu</SheetTitle>

                        <MenuOptions />

                        <SheetDescription></SheetDescription>
                    </SheetContent>
                </Sheet>
            </nav>
        </div>
    )
}

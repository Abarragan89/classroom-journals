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
import NavLinks from "./nav-links";
import { Separator } from "@/components/ui/separator";
import { Session } from "@/types";

export default function Menu({
    teacherId,
    session
}: {
    teacherId?: string,
    session: Session
}) {
    const renderAuthenticatedMenu = () => (
        <>
            <NavLinks />
            <ActionSubMenu teacherId={teacherId!} session={session as Session} />
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
            return renderAuthenticatedMenu()
        } else {
            return renderGuestMenu();
        }
    };

    return (
        <div className="flex justify-end gap-3">
            <nav className="hidden sm:flex-center w-full max-w-md gap-4">
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

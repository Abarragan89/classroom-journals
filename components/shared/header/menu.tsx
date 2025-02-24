import ModeToggle from "./mode-toggle"
import UserButton from "./user-button"

export default function Menu() {
    return (
        <div className="flex justify-end gap-3">
            <nav className="hidden md:flex w-full max-w-xs gap-1">
                <ModeToggle />
                <UserButton />
            </nav>
        </div>
    )
}

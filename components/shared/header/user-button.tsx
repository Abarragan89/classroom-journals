import Link from "next/link"
import { UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UserButton() {
    return (
        <Button asChild>
            <Link href='/sign-in' className="bg-[var(--primary)]">
                <UserIcon /> Sign In
            </Link>
        </Button>
    )
}

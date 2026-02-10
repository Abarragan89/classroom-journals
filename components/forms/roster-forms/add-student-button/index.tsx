'use client';
import { Button } from "@/components/ui/button"
import { UserRoundPlus } from "lucide-react"

export default function AddStudentBtn({
    onClick
}: {
    onClick: () => void
}) {
    return (
        <Button className="shadow-md" onClick={onClick}>
            <UserRoundPlus /> Add Students
        </Button>
    )
}
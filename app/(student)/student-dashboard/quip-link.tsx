"use client"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function QuipLink({
    quipAlerts
}: {
    quipAlerts: number
}) {

    return (
        <div className="relative">
            <Button asChild>
                <Link href={'/classroom-quips'}>
                    Quips
                </Link>
            </Button>
            {quipAlerts > 0 && (
                <p
                    className="absolute -top-3 -right-1 text-center min-w-6 p-[3px] rounded-full text-xs bg-destructive text-destructive-foreground"
                >
                    {quipAlerts}
                </p>
            )}
        </div>
    )
}

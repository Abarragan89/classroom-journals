"use client"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function QuipLink() {
    return (
        <Button asChild>
            <Link href={'/classroom-quips'}>
                Quips
            </Link>
        </Button>
    )
}

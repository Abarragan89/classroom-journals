"use client"
import { Button } from "./ui/button"
import { Check, X } from "lucide-react"

export default function GradingPanel({
    responseId
}: {
    responseId: string
}) {
    return (
        <div className="flex gap-x-8 mx-auto">
            <X size={35} className="bg-destructive text-primary-foreground opacity-85 hover:cursor-pointer hover:opacity-100 p-2 rounded-full" />
            <Check size={35} className="bg-primary text-primary-foreground opacity-85 hover:cursor-pointer hover:opacity-100 p-2 rounded-full" />
        </div>
    )
}

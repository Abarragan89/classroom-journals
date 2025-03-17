"use client"
import { Check, X } from "lucide-react"

export default function GradingPanel({
    responseId
}: {
    responseId: string
}) {
    return (
        <div className="flex gap-x-8 mx-auto">
            <X size={35} className="bg-destructive text-slate-950 border border-border opacity-85 hover:cursor-pointer hover:opacity-100 p-2 rounded-full" />
            <p  className="text-sm bg-yellow-500 text-slate-950 border border-border opacity-85 hover:cursor-pointer hover:opacity-100 p-2 rounded-full">0.5</p>
            <Check size={35} className="bg-green-600 text-slate-950 border border-border opacity-85 hover:cursor-pointer hover:opacity-100 p-2 rounded-full" />
        </div>
    )
}

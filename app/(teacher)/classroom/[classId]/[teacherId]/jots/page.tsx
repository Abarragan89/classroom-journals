import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

export default async function Jots({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {
    console.log(params)
    return (
        <div>
            <h2>Jots</h2>
        </div>
    )
}

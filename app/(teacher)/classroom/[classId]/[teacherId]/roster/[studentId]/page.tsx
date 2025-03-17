import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { prisma } from "@/db/prisma";
import { decryptText } from "@/lib/utils";

export default async function SingleStudentView({
    params
}: {
    params: Promise<{ studentId: string, classId: string, teacherId: string }>
}) {

    const { studentId, classId, teacherId, } = await params;

    const studentData = await prisma.user.findUnique({
        where: { id: studentId }
    })

    return (
        <div>
            <h2 className="text-2xl lg:text-3xl mt-5">{decryptText(studentData?.name as string, studentData?.iv as string)}</h2>
        </div>
    )
}

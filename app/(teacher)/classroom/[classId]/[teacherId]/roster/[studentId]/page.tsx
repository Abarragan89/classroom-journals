import { prisma } from "@/db/prisma";
import { decryptText } from "@/lib/utils";

export default async function SingleStudentView({
    params
}: {
    params: Promise<{ studentId: string, classId: string, teacherId: string }>
}) {

    const { studentId} = await params;

    const studentData = await prisma.user.findUnique({
        where: { id: studentId },
        select: {
            username: true,
            iv: true,
            name: true,
        }
    })

    return (
        <div>
            <h2 className="text-2xl lg:text-3xl mt-5">{decryptText(studentData?.name as string, studentData?.iv as string)}</h2>
            <p>What goes here?</p>
        </div>
    )
}

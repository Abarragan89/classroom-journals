import { Class } from "@/types";
import ClassSettings from "./class-settings";
import { getSingleClassroom, getClassUserRole, getCoTeachersInClass } from "@/lib/server/classroom";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { ClassUserRole } from "@prisma/client";

export default async function Settings({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {

    const { classId } = await params;
    const session = await auth();
    if (!session) return notFound();

    const userId = session.user?.id as string;

    const userRole = await getClassUserRole(classId, userId);

    if (userRole === ClassUserRole.CO_TEACHER) {
        redirect(`/classroom/${classId}/${userId}`);
    }
    if (!userRole || userRole !== ClassUserRole.TEACHER) {
        return notFound();
    }

    const [teacherInfo, coTeachers] = await Promise.all([
        getSingleClassroom(classId, userId) as Promise<Class>,
        getCoTeachersInClass(classId),
    ]);

    return (
        <ClassSettings
            classInfo={teacherInfo}
            teacherId={userId}
            classId={classId}
            coTeachers={coTeachers}
        />
    )
}

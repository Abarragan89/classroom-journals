import { Class } from "@/types";
import ClassSettings from "./class-settings";
import { getSingleClassroom } from "@/lib/server/classroom";

export default async function Settings({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {

    const { teacherId, classId } = await params;

    const teacherInfo = await getSingleClassroom(classId, teacherId) as Class;

    return (
        <ClassSettings
            classInfo={teacherInfo}
            teacherId={teacherId}
            classId={classId}
        />
    )
}

import { getTeacherSettingData } from "@/lib/actions/profile.action"
import { Class } from "@/types";
import ClassSettings from "./class-settings";

export default async function Settings({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {

    const { teacherId, classId } = await params;

    const teacherInfo = await getTeacherSettingData(teacherId, classId);

    return (
        <ClassSettings
            classInfo={teacherInfo.classInfo as unknown as Class}
        />
    )
}

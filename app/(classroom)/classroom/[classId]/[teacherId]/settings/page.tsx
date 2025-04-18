import { getTeacherSettingData } from "@/lib/actions/profile.action"
import { Classroom } from "@/types";
import ClassSettings from "./class-settings";

export default async function Settings({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {

    const { teacherId, classId } = await params;

    const teacherInfo = await getTeacherSettingData(teacherId, classId);

    return (
        <div>
            <h2 className="text-2xl lg:text-3xl mt-2 mb-10">Class Settings</h2>
            {/* <UserSettings
                teacherData={teacherInfo.teacher as unknown as User}
            />
            <Separator className="my-10" /> */}

            <ClassSettings
                classInfo={teacherInfo.classInfo as unknown as Classroom}
            />

            {/* <Separator className="my-10" />

            <SubscriptionSection
                teacherData={teacherInfo?.teacher as unknown as User}
            /> */}
        </div>
    )
}

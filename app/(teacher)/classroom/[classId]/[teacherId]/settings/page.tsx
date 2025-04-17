import { getTeacherSettingData } from "@/lib/actions/profile.action"
import UserSettings from "@/components/user-settings";
import { Classroom, User } from "@/types";
import { Separator } from "@/components/ui/separator";
import ClassSettings from "./class-settings";
import SubscriptionSection from "@/components/shared/subscription-section";

export default async function Settings({
    params
}: {
    params: Promise<{ classId: string, teacherId: string }>
}) {

    const { teacherId, classId } = await params;

    const teacherInfo = await getTeacherSettingData(teacherId, classId);

    return (
        <div>
            <h2 className="text-2xl lg:text-3xl mt-2">Settings</h2>
            <UserSettings
                teacherData={teacherInfo.teacher as unknown as User}
            />
            <Separator className="my-10" />

            <ClassSettings
                classInfo={teacherInfo.classInfo as unknown as Classroom}
            />

            <Separator className="my-10" />

            <SubscriptionSection
                teacherData={teacherInfo?.teacher as unknown as User}
            />
        </div>
    )
}

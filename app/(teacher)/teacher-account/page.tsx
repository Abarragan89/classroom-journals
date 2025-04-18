import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { Session, User } from "@/types";
import UserSettings from "@/components/user-settings";
import { prisma } from "@/db/prisma";
import { decryptText } from "@/lib/utils";
import SubscriptionSection from "@/components/shared/subscription-section";
import { Separator } from "@/components/ui/separator";

export default async function PromptLibraryPage() {

    const session = await auth() as Session

    if (!session) notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId || session?.user?.role !== 'teacher') notFound()

    const teacherData = await prisma.user.findUnique({
        where: { id: teacherId },
        select: {
            username: true,
            name: true,
            iv: true,
            email: true,
            accountType: true,
            id: true,
            image: true,
            subscriptionExpires: true,
            subscriptionId: true,
            isCancelling: true,
            customerId: true,
        }
    })

    const decryptedTeacher = {
        image: teacherData?.image,
        id: teacherData?.id,
        isCancelling: teacherData?.isCancelling,
        accountType: teacherData?.accountType,
        subscriptionExpires: teacherData?.subscriptionExpires,
        customerId: teacherData?.customerId,
        subscriptionId: teacherData?.subscriptionId,
        email: teacherData?.email,
        username: decryptText(teacherData?.username as string, teacherData?.iv as string),
        name: decryptText(teacherData?.name as string, teacherData?.iv as string),
    }

    return (
        <>
            <main className="wrapper">
                <h1 className="h1-bold">My Account</h1>
                <UserSettings
                    teacherData={decryptedTeacher as unknown as User}
                />
                <Separator className="my-10" />

                <SubscriptionSection
                    teacherData={decryptedTeacher as unknown as User}
                />
            </main>
        </>
    )
}
import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { notFound } from "next/navigation";
import { Session } from "@/types";
import { determineSubscriptionAllowance } from "@/lib/actions/profile.action";

export default async function TeacherLayout({
    children,
    params
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ classId: string }>
}>) {

    const session = await auth()

    if (!session) notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId) notFound()

    const { isAllowedToMakeNewClass, isAllowedToMakePrompt } = await determineSubscriptionAllowance(teacherId)

    return (
        <>
            <Header
                teacherId={teacherId}
                session={session as Session}
                isAllowedToMakeNewClass={isAllowedToMakeNewClass as boolean}
                isAllowedToMakePrompt={isAllowedToMakePrompt as boolean}
            />
            {children}
        </>
    );
}
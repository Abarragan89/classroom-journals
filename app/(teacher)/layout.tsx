import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { notFound } from "next/navigation";
import { Session } from "@/types";
import { determineSubscriptionAllowance } from "@/lib/actions/profile.action";

export default async function TeacherLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const session = await auth()

    if (!session) return notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId) return notFound()

    const { isAllowedToMakeNewClass } = await determineSubscriptionAllowance(teacherId)

    return (
        <>
            <Header
                teacherId={teacherId}
                session={session as Session}
                isAllowedToMakeNewClass={isAllowedToMakeNewClass as boolean}
            />
            {children}
        </>
    );
}
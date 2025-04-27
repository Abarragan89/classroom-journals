import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { Session, User } from "@/types";
import UserSettings from "@/components/user-settings";
import SubscriptionSection from "@/components/shared/subscription-section";
import { Separator } from "@/components/ui/separator";
import { getTeacherAccountData } from "@/lib/actions/profile.action";
import AccountClientWrapper from "./account-client-wrapper";

export default async function PromptLibraryPage() {

    const session = await auth() as Session

    if (!session) notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId || session?.user?.role !== 'teacher') notFound()

    const decryptedTeacher = await getTeacherAccountData(teacherId) as unknown as User

    return (
        <>
            <main className="wrapper">
                <h1 className="h1-bold">My Account</h1>
                <AccountClientWrapper 
                    decryptedTeacher={decryptedTeacher}
                />

            </main>
        </>
    )
}
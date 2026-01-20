import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { getAllClassrooms } from "@/lib/server/classroom";
import { Class, Session } from "@/types";
import UpgradeAccountBtn from "@/components/buttons/upgrade-account-btn";
import ClassCardClientWrapper from "./class-card-client-wrapper";

export default async function Classes() {

    const session = await auth() as Session
    if (!session) return notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId || session?.user?.role !== 'TEACHER') return notFound()

    const allClassrooms = await getAllClassrooms(teacherId) as Class[];

    return (
        <>
            <main className="wrapper relative">
                <h1 className="h1-bold">My Classes</h1>
                <div className="absolute top-2 right-5">
                    <UpgradeAccountBtn
                        teacherId={teacherId}
                    />
                </div>

                <ClassCardClientWrapper
                    allClassrooms={allClassrooms}
                    teacherId={teacherId}
                    session={session as Session}
                />
            </main>
        </>
    )
}
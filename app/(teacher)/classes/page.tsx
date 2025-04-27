import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { getAllClassrooms } from "@/lib/actions/classroom.actions";
import ClassCard from "@/components/shared/class-card";
import { Class, Session } from "@/types";
import AddClassBtn from "@/components/forms/class-forms/add-class-btn";
import { determineSubscriptionAllowance } from "@/lib/actions/profile.action";
import UpgradeAccountBtn from "@/components/buttons/upgrade-account-btn";

export default async function Classes() {

    const session = await auth() as Session

    if (!session) notFound()

    const teacherId = session?.user?.id as string

    if (!teacherId || session?.user?.role !== 'teacher') notFound()

    const allClassrooms = await getAllClassrooms(teacherId) as Class[];

    // const { isSubscriptionActive } = await determineSubscriptionAllowance(teacherId)

    return (
        <>
            <main className="wrapper relative">
                {allClassrooms?.length > 0 ? (
                    <>
                        <h1 className="h1-bold">My Classes</h1>
                        <div className="absolute top-2 right-5">
                            <UpgradeAccountBtn
                                teacherId={teacherId}
                            />
                        </div>

                        <div className="mt-10 flex flex-wrap items-start gap-14 mx-auto">
                            {allClassrooms.map((classroom: Class) => (
                                <ClassCard
                                    key={classroom.id}
                                    teacherId={teacherId}
                                    classData={classroom}
                                />
                            ))
                            }
                        </div>
                    </>
                ) :
                    (
                        <>
                            <h1 className="h1-bold">Create a Class</h1>
                            <div className="flex flex-col mx-auto items-center justify-center text-primary mt-10">
                                {session.googleProviderId && (
                                    <p className="mb-3">Easily import from Google Classroom!</p>
                                )}
                                <div className="w-[90%] max-w-[150px]">
                                    <AddClassBtn
                                        variant='default'
                                        teacherId={teacherId}
                                        closeSubMenu={undefined}
                                        session={session as Session}
                                        isAllowedToMakeNewClass={true}
                                    />
                                </div>
                            </div>
                        </>
                    )
                }
            </main>
        </>
    )
}
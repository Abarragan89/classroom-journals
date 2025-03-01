import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Header from "@/components/shared/header";

export default async function JotLibrary() {
    const session = await auth()

    if (!session) notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId) notFound()

    // const allClassrooms = await getAllClassrooms(teacherId) as Class[]

    return (
        <>
            <Header teacherId={teacherId} />
            <h1>My Jots</h1>
            <div className="mt-10 flex flex-wrap justify-center items-end gap-14 mx-auto wrapper">
            {/* Insert all the prompt jot cards here */}


            </div>
        </>
    )
}
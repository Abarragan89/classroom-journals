import PromptLibrary from "@/components/shared/jot-library-server-comp"
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { Session } from "@/types";

export default async function PromptLibraryPage() {

    const session = await auth() as Session

    if (!session) notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId || session?.user?.role !== 'teacher') notFound()

    return (
        <>
            <PromptLibrary
                teacherId={teacherId}
            />
        </>
    )
}
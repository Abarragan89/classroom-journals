import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Header from "@/components/shared/header";
import EditPromptForm from "@/components/forms/edit-prompt-form";
import { getSinglePrompt } from "@/lib/actions/prompt.actions";
import { Prompt } from "@/types";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export default async function EditPrompt({
    params,
}: {
    params: Promise<{ promptId: string }>
}) {
    const session = await auth()

    if (!session) notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId) notFound()

    const { promptId } = await params;

    const promptData = await getSinglePrompt(promptId) as unknown as Prompt
    
    // Ensure prompt belongs to teacher
    if (promptData.teacherId !== teacherId) notFound()


    return (
        <>
            <Header teacherId={teacherId} />
            <main className="wrapper mx-auto">
                <Link href={'/prompt-library'} className="flex items-center hover:underline">
                    <ArrowLeftIcon className="mr-1" size={20} />Back to all Jots
                </Link>
                <h1 className="h1-bold mt-5">{promptData.title}</h1>
                <div className="max-w-[550px] mx-auto mt-2">
                    <EditPromptForm teacherId={teacherId} promptData={promptData} />
                </div>
            </main>
        </>
    )
}
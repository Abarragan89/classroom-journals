import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Header from "@/components/shared/header";
import EditMultiPromptForm from "@/components/forms/prompt-forms/edit-multi-prompt-form";
import { getSinglePrompt } from "@/lib/actions/prompt.actions";
import { Prompt, Session } from "@/types";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import EditSinglePromptForm from "@/components/forms/prompt-forms/edit-single-prompt-form";

export default async function EditPrompt({
    params,
    searchParams
}: {
    params: Promise<{ promptId: string }>,
    searchParams: Promise<{ type: string }>
}) {
    const session = await auth() as Session

    if (!session) notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId || session?.user?.role !== 'teacher') notFound()

    const { promptId } = await params;

    const promptData = await getSinglePrompt(promptId) as unknown as Prompt

    // Ensure prompt belongs to teacher
    if (promptData.teacherId !== teacherId) notFound()

    const { type } = await searchParams;

    return (
        <>
            <Header teacherId={teacherId} session={session as Session} />
            <main className="wrapper mx-auto">
                <Link href={'/prompt-library'} className="flex items-center hover:underline w-fit">
                    <ArrowLeftIcon className="mr-1" size={20} />Back to all Jots
                </Link>
                {type === 'single-question' ? (
                    <>
                        <h1 className="h1-bold mt-5">Edit Blog Prompt</h1>
                        <div className="max-w-[600px] mx-auto mt-5">
                            <EditSinglePromptForm promptData={promptData} teacherId={teacherId} />
                        </div>
                    </>
                ) : type === 'multi-question' ? (
                    <>
                        <h1 className="h1-bold mt-5">{promptData.title}</h1>
                        <div className="max-w-[600px] mx-auto mt-5">
                            <EditMultiPromptForm promptData={promptData} teacherId={teacherId} />
                        </div>
                    </>
                ) : (
                    <></>
                )}
            </main>
        </>
    )
}
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Header from "@/components/shared/header";
import SinglePromptForm from "@/components/forms/prompt-forms/single-prompt-form";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import MultiPromptForm from "@/components/forms/prompt-forms/multi-prompt-form";
import { Session } from "@/types";

export default async function CreatePrompt({
    searchParams
}: {
    searchParams: Promise<{ type: string }>
}) {
    const session = await auth() as Session

    if (!session) notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId || session?.user?.role !== 'teacher') notFound()

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
                        <h1 className="h1-bold mt-5">New Blog Prompt</h1>
                        <div className="max-w-[600px] mx-auto mt-5">
                            <SinglePromptForm teacherId={teacherId} />
                        </div>
                    </>
                ) : type === 'multi-question' ? (
                    <>
                        <h1 className="h1-bold mt-5">New Multi-Question</h1>
                        <div className="max-w-[600px] mx-auto mt-5">
                            <MultiPromptForm teacherId={teacherId} />
                        </div>
                    </>
                ) : (
                    <></>
                )}
            </main>
        </>
    )
}
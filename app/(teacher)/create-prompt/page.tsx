import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Header from "@/components/shared/header";
import AddSinglePromptForm from "@/components/forms/add-single-prompt-form";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import AddMultiPromptForm from "@/components/forms/add-multi-prompt-form";
import { Session } from "@/types";

export default async function CreatePrompt({
    searchParams
}: {
    searchParams: Promise<{ type: string }>
}) {
    const session = await auth()

    if (!session) notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId) notFound()

    const { type } = await searchParams;

    return (
        <>
            <Header teacherId={teacherId} session={session as Session}/>
            <main className="wrapper mx-auto">
                <Link href={'/prompt-library'} className="flex items-center hover:underline w-fit">
                    <ArrowLeftIcon className="mr-1" size={20} />Back to all Jots
                </Link>
                {type === 'single-question' ? (
                    <>
                        <h1 className="h1-bold mt-5">New Journal Jot</h1>
                        <div className="max-w-[600px] mx-auto mt-5">
                            <AddSinglePromptForm teacherId={teacherId} />
                        </div>
                    </>
                ) : type === 'multi-question' ? (
                    <>
                        <h1 className="h1-bold mt-5">New Multi-Question</h1>
                        <div className="max-w-[600px] mx-auto mt-5">
                            <AddMultiPromptForm teacherId={teacherId} />
                        </div>
                    </>
                ) : (
                    <></>
                )}
            </main>
        </>
    )
}
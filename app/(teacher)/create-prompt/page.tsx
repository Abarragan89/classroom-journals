import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Header from "@/components/shared/header";
import AddPromptForm from "@/components/forms/add-prompt-form";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import AddMultiPromptForm from "@/components/forms/add-multi-prompt-form";

export default async function CreatePrompt({
    searchParams
}: {
    searchParams: Record<string, string | string[] | undefined>
}) {
    const session = await auth()

    if (!session) notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId) notFound()

    const {type} = await searchParams;

    // if (!query) null

    return (
        <>
            <Header teacherId={teacherId} />
            <main className="wrapper mx-auto">
                <Link href={'/prompt-library'} className="flex items-center hover:underline">
                    <ArrowLeftIcon className="mr-1" size={20} />Back to all Jots
                </Link>
                {query === 'single-prompt' ? (
                    <>
                        <h1 className="h1-bold mt-5">New Journal / Essay</h1>
                        <div className="max-w-[600px] mx-auto mt-5">
                            <AddPromptForm teacherId={teacherId} />
                        </div>
                    </>
                ) : query === 'multi-prompt' ? (
                    <>
                        <h1 className="h1-bold mt-5">New Multi-Question</h1>
                        <div className="max-w-[600px] mx-auto mt-5">
                            <AddMultiPromptForm teacherId={teacherId} />
                        </div>
                    </>
                ) : (
                    <></>
                )
                }
            </main>
        </>
    )
}
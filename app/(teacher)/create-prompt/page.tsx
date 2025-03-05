import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Header from "@/components/shared/header";
import AddPromptForm from "@/components/forms/add-prompt-form";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export default async function CreatePrompt() {
    const session = await auth()

    if (!session) notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId) notFound()


    return (
        <>
            <Header teacherId={teacherId} />
            <main className="wrapper mx-auto">
                <Link href={'/prompt-library'} className="flex items-center hover:underline">
                    <ArrowLeftIcon className="mr-1" size={20} />Back to all Jots
                </Link>
                <h1 className="h1-bold mt-5">New Jot</h1>
                <div className="max-w-[600px] mx-auto mt-5">
                    <AddPromptForm teacherId={teacherId} />
                </div>
            </main>
        </>
    )
}
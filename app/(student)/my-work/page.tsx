import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { Response, ResponseData, Session } from "@/types";
import { notFound } from "next/navigation";
import { getSingleStudentResponses } from "@/lib/actions/response.action";
import Link from "next/link";
import { formatDateLong } from "@/lib/utils";
import { responsePercentage } from "@/lib/utils";
import { ArrowLeftIcon } from "lucide-react";

export default async function MyWork() {

    const session = await auth() as Session

    if (!session) notFound()

    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'student' || !studentId) {
        notFound()
    }

    const studentResponses = await getSingleStudentResponses(studentId) as unknown as Response[]

    return (
        <>
            <Header session={session} studentId={studentId} />
            <main className="wrapper">
                <Link href='/student-dashboard' className="flex items-center hover:underline w-fit print:hidden">
                    <ArrowLeftIcon className="mr-1" size={20} />
                    Back to Dashboard
                </Link>
                <h1 className="h1-bold mt-2 line-clamp-1">My Responses</h1>
                <div className="mt-5 space-y-5">
                    {studentResponses?.length > 0 && studentResponses?.map((response: Response) => {
                        // Determine grade for blog and assessment
                        let score: string = 'N/A'
                        if (response.promptSession?.promptType === 'single-question') {
                            score = ((response?.response as { score?: number }[] | undefined)?.[0]?.score)?.toString() ?? 'N/A'
                            score = score !== 'N/A' ? `${score}%` : score
                        } else {
                            score = responsePercentage(response?.response as unknown as ResponseData[]);
                        }
                        return (
                            <Link
                                key={response.id}
                                className='max-w-[600px] mx-auto block' href={`response-review/${response?.id}`}>
                                {/* only show public or private if it is a blog, otherwise don't render */}
                                <article className='bg-card flex-start opacity-80 px-5 py-4 rounded-lg mb-4 border border-border hover:cursor-pointer hover:opacity-100'>
                                    <p
                                        className='text-2xl font-bold bg-input text-background p-1 px-3 rounded-full mr-3'
                                    >
                                        {response?.promptSession?.promptType === 'single-question' ? 'B' : 'A'}
                                    </p>
                                    <div className="flex flex-col w-full">
                                        <p className='text-md font-bold line-clamp-1 text-foreground'>{response?.promptSession?.title}</p>
                                        <div className="flex relative top-[8px] justify-between text-xs text-input">
                                            {response?.isSubmittable ? (
                                                <p className="text-success font-bold">Returned</p>
                                            ) : (
                                                <p>Submitted: {formatDateLong(response?.submittedAt, 'short')}</p>
                                            )}

                                            {response?.promptSession?.areGradesVisible ? (
                                                <p>Grade: {score}</p>
                                            ) : (
                                                <p>Not Graded</p>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        )
                    })}
                </div>
            </main>
        </>
    )
}

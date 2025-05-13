import { prisma } from "@/db/prisma";
import { decryptText, formatDateLong, responsePercentage } from "@/lib/utils";
import { Response, ResponseData } from "@/types";
import Link from "next/link";
export default async function SingleStudentView({
    params
}: {
    params: Promise<{ studentId: string, classId: string, teacherId: string }>
}) {

    const { studentId, classId, teacherId } = await params;

    const studentData = await prisma.user.findUnique({
        where: { id: studentId },
        select: {
            id: true,
            username: true,
            iv: true,
            name: true,
            responses: {
                where: {
                    completionStatus: {
                        in: ['COMPLETE', 'RETURNED'],
                    },
                },
                select: {
                    id: true,
                    response: true,
                    submittedAt: true,
                    promptSession: {
                        select: {
                            id: true,
                            title: true,
                            promptType: true,
                        }
                    }
                }
            }
        }
    })

    const studentResponses = studentData?.responses as Response[]

    return (
        <div>
            <h2 className="text-2xl lg:text-3xl">{decryptText(studentData?.name as string, studentData?.iv as string)}</h2>
            <div className="mt-10">
                {studentResponses?.length > 0 ? studentResponses?.map((response: Response) => {
                    // Determine grade for blog and assessment
                    let score: string = 'N/A'
                    if (response.promptSession?.promptType === 'BLOG') {
                        score = ((response?.response as { score?: number }[] | undefined)?.[0]?.score)?.toString() ?? 'N/A'
                        score = score !== 'N/A' ? `${score}%` : score
                    } else {
                        score = responsePercentage(response?.response as unknown as ResponseData[]);
                    }
                    return (
                        <Link
                            key={response.id}
                            className='max-w-[700px] mx-auto' href={`/classroom/${classId}/${teacherId}/single-prompt-session/${response?.promptSession?.id}/single-response/${response.id}`}>
                            {/* only show public or private if it is a blog, otherwise don't render */}
                            <article className='bg-card flex-start opacity-80 px-5 py-4 rounded-lg mb-4 border border-border hover:cursor-pointer hover:opacity-100'>
                                <p
                                    className='text-2xl font-bold bg-input text-background p-1 px-3 rounded-full mr-3'
                                >
                                    {response?.promptSession?.promptType === 'BLOG' ? 'B' : 'A'}
                                </p>
                                <div className="flex flex-col w-full">
                                    <p className='text-md font-bold line-clamp-1 text-foreground'>{response?.promptSession?.title}</p>
                                    <div className="flex relative top-[8px] justify-between text-xs text-input">
                                        <p>Submitted: {formatDateLong(response?.submittedAt, 'short')}</p>
                                        <p>Grade: {score}</p>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    )
                }) : (
                    <p className="text-lg text-center italic">No Work Submitted</p>
                )}
            </div>
        </div>
    )
}

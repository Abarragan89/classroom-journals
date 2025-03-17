import GradeResponseCard from '@/components/shared/grade-response-card';
import { prisma } from '@/db/prisma';
import { decryptText, formatDateShort } from '@/lib/utils';
import { Response, ResponseData } from '@/types';


export default async function SingleResponse({
    params
}: {
    params: Promise<{ responseId: string }>
}) {
    const { responseId } = await params;

    if (!responseId) {
        return <div>No response ID provided</div>;
    }

    const response = await prisma.response.findUnique({
        where: { id: responseId },
        include: {
            student: {
                select: {
                    name: true,
                    iv: true
                }
            }
        }
    }) as unknown as Response;

    if (!response) {
        return <div>Response not found</div>;
    }

    const questionsAndAnswers = response.response as unknown as ResponseData[]

    return (
        <div className='mb-10'>
            <div className="mb-10 space-y-1">
                <h2 className="text-2xl lg:text-3xl mt-2">Response By: {decryptText(response?.student?.name as string, response.student.iv as string)}</h2>
                <p>Submitted: {formatDateShort(response.submittedAt)}</p>
            </div>
            <div className="flex flex-wrap justify-start gap-10">
                <GradeResponseCard
                    questionsAndAnswers={questionsAndAnswers}
                    responseId={responseId}
                />
            </div>
        </div>
    );
}

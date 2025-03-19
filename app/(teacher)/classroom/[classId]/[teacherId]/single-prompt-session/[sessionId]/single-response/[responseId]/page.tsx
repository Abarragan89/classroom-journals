import ScoreJournalForm from '@/components/forms/score-journal-form';
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
            },
            promptSession: {
                select: {
                    promptType: true,
                    title: true
                }
            }
        }
    }) as unknown as Response;

    if (!response) {
        return <div>Response not found</div>;
    }

    const questionsAndAnswers = response.response as unknown as ResponseData[]
    const isMultiQuestion = response?.promptSession?.promptType === 'multi-question';

    return (
        <div className='mb-10'>
            <div className="mb-10 space-y-1">
                <h2 className="text-2xl lg:text-3xl mt-2">Response By: {decryptText(response?.student?.name as string, response.student.iv as string)}</h2>
                <p>Submitted: {formatDateShort(response.submittedAt)}</p>
            </div>
            <div className="flex flex-wrap justify-start gap-10 max-w-[1200px] mx-auto">
                {isMultiQuestion ? (
                    <GradeResponseCard
                        questionsAndAnswers={questionsAndAnswers}
                        responseId={responseId}
                    />
                ) : (
                    <div className='relative'>
                        <ScoreJournalForm
                            responseId={response.id}
                            currentScore={(response?.response as { score?: number }[] | undefined)?.[0]?.score ?? 0}
                        />
                        <p>{response.promptSession?.title}</p>
                        <p className='mt-10 bg-card p-5 rounded-md'>
                            {(response?.response as { answer?: string }[] | undefined)?.[0]?.answer ?? ''}
                        </p>
                    </div>
                )}
            </div>
        </div >
    );
}

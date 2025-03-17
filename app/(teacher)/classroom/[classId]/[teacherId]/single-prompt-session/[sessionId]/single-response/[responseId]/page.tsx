import GradingPanel from '@/components/grading-panel';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from '@/components/ui/separator';
import { prisma } from '@/db/prisma';
import { decryptText, formatDateShort } from '@/lib/utils';
import { Response } from '@/types';

interface ResponseData {
    id: string;
    answer: string;
    question: string;
    scores: number;
}

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
        <div>
            <div className="mb-10 space-y-1">
                <h2 className="text-2xl lg:text-3xl mt-2">Response By: {decryptText(response?.student?.name as string, response.student.iv as string)}</h2>
                <p>Submitted: {formatDateShort(response.submittedAt)}</p>
            </div>
            <div className="flex flex-wrap justify-start gap-7">
                {questionsAndAnswers?.length > 0 && questionsAndAnswers.map((responseData: ResponseData, index: number) => (
                    <Card className='w-full p-4 space-y-3' key={responseData.id}>
                        <div className="flex-between text-sm">
                            <p>Question {index + 1}</p>
                            <p className='ml-2'> Marked As: Incorrect</p>
                        </div>
                        <Separator />
                        <CardTitle className='p-2 leading-snug'>{responseData.question}</CardTitle>
                        <CardContent className='p-3 pt-0'>
                            <p className='ml-1'>Answer:</p>
                            <div className='bg-background p-2 rounded-md'>
                                {responseData.answer}
                            </div>
                        </CardContent>
                        <Separator />
                        <CardFooter className='p-3 pt-1 pb-1'>
                            <GradingPanel responseId={responseId} />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

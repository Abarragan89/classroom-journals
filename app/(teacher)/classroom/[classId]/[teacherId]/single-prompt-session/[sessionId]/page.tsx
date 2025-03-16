
import { prisma } from '@/db/prisma';
import Link from 'next/link';

export default async function SinglePromptSession({
    params
}: {
    params: Promise<{ sessionId: string }>
}) {

    const { sessionId } = await params;

    if (!sessionId) {
        return <div>No session ID provided</div>;
    }

    const promptSession = await prisma.promptSession.findUnique({
        where: { id: sessionId },
        include: {
            responses: {
                select: {
                    id: true,
                    submittedAt: true,
                },
            },
            prompt: {
                select: {
                    title: true,
                },
            },
        },
    });

    if (!promptSession) {
        return <div>Prompt session not found</div>;
    }
    console.log('prompot session ', promptSession)
    return (
        <div>
            <h1>{promptSession.prompt.title}</h1>
            <h2>Responses:</h2>
            {promptSession.responses.map((response) => (
                <Link href={`/single-response/${response.id}`} key={response.id}>
                    {/* <p>{response?.submittedAt}</p> */}
                </Link>
            ))}
        </div>
    );
}


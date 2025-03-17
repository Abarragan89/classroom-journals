import { prisma } from '@/db/prisma';
import { Response } from '@/types';

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
    }) as unknown as Response;

    if (!response) {
        return <div>Response not found</div>;
    }

    return (
        <div>
            <h1>Response ID: {response.id}</h1>
            <p>Submitted At: {new Date(response.submittedAt).toLocaleString()}</p>
            <h2>Questions and Answers:</h2>

        </div>
    );
}

import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCell
} from "@/components/ui/table"
import { prisma } from '@/db/prisma';
import Link from 'next/link';
import { formatDateShort } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { decryptText } from "@/lib/utils";

export default async function SinglePromptSession({
    params
}: {
    params: Promise<{ classId: string, teacherId: string, sessionId: string }>
}) {

    const { sessionId, classId, teacherId } = await params;

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
                    student: {
                        select: {
                            id: true,
                            name: true,
                            iv: true,
                        }
                    }
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

    return (
        <div>
            <h2 className="text-2xl lg:text-3xl line-clamp-4 mt-7">{promptSession.prompt.title}</h2>
            <Table className="mt-5">
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Comments</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">&nbsp;</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {promptSession.responses.map((response) => (
                        <TableRow key={response.id}>
                            <TableCell className="font-medium">
                                <Link
                                    className="underline hover:text-accent"
                                    href={`/classroom/${classId}/${teacherId}/single-prompt-session/${promptSession.id}/single-response/${response.id}`}>
                                    {decryptText(response.student.name as string, response.student.iv as string)}
                                </Link>
                            </TableCell>
                            <TableCell>6 / 7</TableCell>
                            <TableCell>(92%)</TableCell>
                            <TableCell>13</TableCell>
                            <TableCell>{formatDateShort(response.submittedAt)}</TableCell>
                            <TableCell className="text-right">
                                <Button asChild variant='secondary' className="h-7">
                                    <Link
                                        href={`/classroom/${classId}/${teacherId}/single-response/${response.id}`}>
                                        Review
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}


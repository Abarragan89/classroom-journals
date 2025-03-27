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
import { decryptText } from "@/lib/utils";
import { ClipboardCheckIcon } from "lucide-react";
import { ResponseData, User } from "@/types";
import { PromptSession } from "@/types";
import { getAllStudents } from "@/lib/actions/classroom.actions";
import EditPromptSessionPopUp from "@/components/modalBtns/edit-prompt-session-popup";

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
        select: {
            status: true,
            id: true,
            promptType: true,
            responses: {
                select: {
                    id: true,
                    submittedAt: true,
                    response: true,
                    student: {
                        select: {
                            id: true,
                            name: true,
                            iv: true,
                        }
                    },
                    _count: {
                        select: {
                            comments: true
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
    }) as unknown as PromptSession;

    if (!promptSession) {
        return <div>Prompt session not found</div>;
    }

    const studentSubmittedWithFormattedNamed = promptSession?.responses?.map(response => ({
        ...response,
        student: {
            name: decryptText(response.student.name as string, response.student.iv as string)
        }
    }));

    // Get student list to show which students have not submitted
    const classRoster = await getAllStudents(classId) as User[]
    const studentSubmittedIds = promptSession?.responses?.map(user => user.student.id)
    const notSubmitted = classRoster.filter(student => !studentSubmittedIds?.includes(student.id))

    function responseScore(response: ResponseData[]) {
        const isGraded = response.every(entry => entry.score !== undefined)
        if (!isGraded) {
            return (
                'Not Graded'
            )
        }
        const totalQuestions = response.length
        const score = response.reduce((accum, currVal) => currVal.score + accum, 0)
        return `${score} / ${totalQuestions}`
    }

    function responsePercentage(response: ResponseData[]) {
        const isGraded = response.every(entry => entry.score !== undefined)
        if (!isGraded) {
            return (
                'N/A'
            )
        } else {
            const totalQuestions = response.length
            const score = response.reduce((accum, currVal) => currVal.score + accum, 0)
            return `${(Math.round((score / totalQuestions) * 100)).toString()}%`
        }
    }

    return (
        <div>
            <h2 className="text-1xl lg:text-2xl line-clamp-3 mt-5">{promptSession?.prompt?.title}</h2>
                <EditPromptSessionPopUp
                    promptSessionType={promptSession.promptType}
                    promptSessionId={promptSession.id}
                    initialStatus={promptSession.status}
                />
            {promptSession.promptType === 'multi-question' ? (
                <Table className="mt-5">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">&nbsp;</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Submitted</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={6} className="text-center font-bold bg-background text-success">Submitted</TableCell>
                        </TableRow>
                        {(studentSubmittedWithFormattedNamed ?? []).sort((a, b) => {
                            const lastNameA = a.student.name?.split(" ")[1] ?? "";
                            const lastNameB = b.student.name?.split(" ")[1] ?? "";
                            return lastNameA.localeCompare(lastNameB);
                        }).map((response) => (
                            <TableRow key={response.id}>
                                <TableCell>
                                    <Link
                                        className="hover:cursor-pointer hover:text-accent"
                                        href={`/classroom/${classId}/${teacherId}/single-prompt-session/${promptSession.id}/single-response/${response.id}`}>
                                        <ClipboardCheckIcon />
                                    </Link>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {response.student.name}
                                </TableCell>
                                <TableCell>{responseScore(response.response as unknown as ResponseData[])}</TableCell>
                                <TableCell>{responsePercentage(response.response as unknown as ResponseData[])}</TableCell>
                                <TableCell>{formatDateShort(response.submittedAt)}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={6} className="text-center font-bold bg-background text-destructive">Not Submitted</TableCell>
                        </TableRow>
                        {notSubmitted?.length > 0 && notSubmitted.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>&nbsp;</TableCell>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                // Journal Table
                <Table className="mt-5">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">&nbsp;</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Comments</TableHead>
                            <TableHead>Submitted</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={6} className="text-center font-bold bg-background text-success">Submitted</TableCell>
                        </TableRow>
                        {(studentSubmittedWithFormattedNamed ?? []).sort((a, b) => {
                            const lastNameA = a.student.name?.split(" ")[1] ?? "";
                            const lastNameB = b.student.name?.split(" ")[1] ?? "";
                            return lastNameA.localeCompare(lastNameB);
                        }).map((response) => (
                            <TableRow key={response.id}>
                                <TableCell>
                                    <Link
                                        className="hover:cursor-pointer hover:text-accent"
                                        href={`/classroom/${classId}/${teacherId}/single-prompt-session/${promptSession.id}/single-response/${response.id}`}>
                                        <ClipboardCheckIcon />
                                    </Link>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {response.student.name}
                                </TableCell>
                                <TableCell>{(response?.response as { score?: number }[] | undefined)?.[0]?.score ?? '-'}%</TableCell>
                                <TableCell>{response?._count?.comments || 0}</TableCell>
                                <TableCell>{formatDateShort(response.submittedAt)}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={6} className="text-center font-bold bg-background text-destructive">Not Submitted</TableCell>
                        </TableRow>
                        {notSubmitted?.length > 0 && notSubmitted.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>&nbsp;</TableCell>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}


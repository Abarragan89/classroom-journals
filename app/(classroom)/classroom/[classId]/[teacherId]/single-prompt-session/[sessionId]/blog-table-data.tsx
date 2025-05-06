"use client"
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCell
} from "@/components/ui/table"
import { formatDateShort } from "@/lib/utils";
import { Response, User } from "@/types";
import { ClipboardCheckIcon } from "lucide-react";
import Link from "next/link";

export default function BlogTableData({
    promptSessionId,
    classId,
    teacherId,
    notAssigned,
    incompleteResponses,
    completedResponses,
    returnedResponses
}: {
    promptSessionId: string;
    classId: string;
    teacherId: string;
    notAssigned: User[];
    incompleteResponses: Response[],
    completedResponses: Response[],
    returnedResponses: Response[]

}) {

    return (
        <Table className="mt-3">
            <TableHeader>
                <TableRow>
                    <TableHead className="text-right">&nbsp;</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Submitted</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {/* Completed Assignments */}
                {completedResponses.length > 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center font-bold bg-background text-success">Submitted</TableCell>
                    </TableRow>
                )}
                {(completedResponses ?? []).sort((a, b) => {
                    const lastNameA = a.student.name?.split(" ")[1] ?? "";
                    const lastNameB = b.student.name?.split(" ")[1] ?? "";
                    return lastNameA.localeCompare(lastNameB);
                }).map((response) => (
                    <TableRow key={response.id}>
                        <TableCell>
                            <Link
                                className="hover:cursor-pointer hover:text-accent"
                                href={`/classroom/${classId}/${teacherId}/single-prompt-session/${promptSessionId}/single-response/${response.id}`}>
                                <ClipboardCheckIcon />
                            </Link>
                        </TableCell>
                        <TableCell className="font-medium">
                            {response.student.name}
                        </TableCell>
                        <TableCell>{(response?.response as { score?: number }[] | undefined)?.[0]?.score ?? '-'}%</TableCell>
                        <TableCell>{response?._count?.comments || 0}</TableCell>
                        <TableCell>{response?.likeCount || 0}</TableCell>
                        <TableCell>{formatDateShort(response.submittedAt)}</TableCell>
                    </TableRow>
                ))}
                {/* INCOMPLETE ASSIGNMENTS */}
                {incompleteResponses.length > 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center font-bold bg-background text-destructive">Not Submitted</TableCell>
                    </TableRow>
                )}
                {(incompleteResponses ?? []).sort((a, b) => {
                    const lastNameA = a.student.name?.split(" ")[1] ?? "";
                    const lastNameB = b.student.name?.split(" ")[1] ?? "";
                    return lastNameA.localeCompare(lastNameB);
                }).map((response) => (
                    <TableRow key={response.id}>
                        <TableCell>
                            <Link
                                className="hover:cursor-pointer hover:text-accent"
                                href={`/classroom/${classId}/${teacherId}/single-prompt-session/${promptSessionId}/single-response/${response.id}`}>
                                <ClipboardCheckIcon />
                            </Link>
                        </TableCell>
                        <TableCell className="font-medium">
                            {response.student.name}
                        </TableCell>
                        <TableCell>{(response?.response as { score?: number }[] | undefined)?.[0]?.score ?? '-'}%</TableCell>
                        <TableCell>{response?._count?.comments || 0}</TableCell>
                        <TableCell>{response?.likeCount || 0}</TableCell>
                        <TableCell>-</TableCell>
                    </TableRow>
                ))}
                {/* RETURNED ASSIGNMENTS */}
                {returnedResponses.length > 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center font-bold bg-background text-warning">Returned</TableCell>
                    </TableRow>
                )}
                {(returnedResponses ?? []).sort((a, b) => {
                    const lastNameA = a.student.name?.split(" ")[1] ?? "";
                    const lastNameB = b.student.name?.split(" ")[1] ?? "";
                    return lastNameA.localeCompare(lastNameB);
                }).map((response) => (
                    <TableRow key={response.id}>
                        <TableCell>
                            <Link
                                className="hover:cursor-pointer hover:text-accent"
                                href={`/classroom/${classId}/${teacherId}/single-prompt-session/${promptSessionId}/single-response/${response.id}`}>
                                <ClipboardCheckIcon />
                            </Link>
                        </TableCell>
                        <TableCell className="font-medium">
                            {response.student.name}
                        </TableCell>
                        <TableCell>{(response?.response as { score?: number }[] | undefined)?.[0]?.score ?? '-'}%</TableCell>
                        <TableCell>{response?._count?.comments || 0}</TableCell>
                        <TableCell>{response?.likeCount || 0}</TableCell>
                        <TableCell>{formatDateShort(response.submittedAt)}</TableCell>
                    </TableRow>
                ))}
                {/* NOT ASSIGNED */}
                {notAssigned.length > 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center font-bold bg-background text-border">Not Assigned</TableCell>
                    </TableRow>
                )}
                {notAssigned?.length > 0 && notAssigned.map((user) => (
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
    )
}

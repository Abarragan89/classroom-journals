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
    studentSubmittedWithFormattedNamed,
    promptSessionId,
    classId,
    teacherId,
    notSubmitted,
}: {
    studentSubmittedWithFormattedNamed: Response[];
    promptSessionId: string;
    classId: string;
    teacherId: string;
    notSubmitted: User[];

}) {
    return (
        <Table className="mt-3">
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
                                href={`/classroom/${classId}/${teacherId}/single-prompt-session/${promptSessionId}/single-response/${response.id}`}>
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
    )
}

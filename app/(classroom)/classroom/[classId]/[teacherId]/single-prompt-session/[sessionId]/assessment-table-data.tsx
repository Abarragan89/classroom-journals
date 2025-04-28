'use client'
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCell
} from "@/components/ui/table"
import { formatDateShort } from "@/lib/utils";
import { PromptSession, Response, ResponseData, User } from "@/types";
import { ClipboardCheckIcon } from "lucide-react";
import Link from "next/link";
import { responsePercentage, responseScore } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getSinglePromptSessionTeacherDashboard } from "@/lib/actions/prompt.session.actions";

export default function AssessmentTableData({
    promptSessionData,
    promptSessionId,
    classId,
    teacherId,
    notSubmitted,
}: {
    promptSessionData: Response[];
    promptSessionId: string;
    classId: string;
    teacherId: string;
    notSubmitted: User[];
}) {

    // const { data: promptSession } = useQuery({
    //     queryKey: ['getStudentAssessmentSessionData'],
    //     queryFn: async () => {
    //         const data = await getSinglePromptSessionTeacherDashboard(promptSessionId) as unknown as PromptSession
    //         console.log('getting back this data ', data)
    //         return data.responses
    //     },
    //     initialData: promptSessionData,
    // })

    const promptSession = promptSessionData

    return (
        <Table className="mt-3">
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
                {(promptSession ?? []).sort((a, b) => {
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
    )
}

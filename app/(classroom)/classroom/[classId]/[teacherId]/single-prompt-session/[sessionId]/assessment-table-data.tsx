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
import { Response, ResponseData, User, PromptSession } from "@/types";
import { ClipboardCheckIcon } from "lucide-react";
import { responsePercentage, responseScore } from "@/lib/utils";
import { createStudentResponse } from "@/lib/actions/response.action";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function AssessmentTableData({
    promptSessionId,
    classId,
    teacherId,
    notAssigned,
    incompleteResponses,
    completedResponses,
    returnedResponses,
    promptSessionQuestions
}: {
    promptSessionId: string;
    classId: string;
    teacherId: string;
    notAssigned: User[];
    incompleteResponses: Response[],
    completedResponses: Response[],
    returnedResponses: Response[],
    promptSessionQuestions: ResponseData[]
}) {

    const router = useRouter();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState<boolean>(false)

    async function createStudentResponseHandler(studentId: string) {
        try {
            setIsLoading(true)
            if (!studentId) return
            const newResponse = await createStudentResponse(promptSessionId, studentId, teacherId, promptSessionQuestions)
            if (!newResponse.success) throw new Error('Error creating student response')

            // Update cache with new response instead of invalidating
            queryClient.setQueryData<PromptSession>(['getSingleSessionData', promptSessionId], (old) => {
                if (!old || !newResponse.data) return old;
                return {
                    ...old,
                    responses: [...(old.responses || []), newResponse.data]
                } as PromptSession;
            });
        } catch (error) {
            console.error('error creating student response', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="border rounded-md mt-5">
            <Table>
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
                    {/* Completed Assignments */}
                    {completedResponses.length > 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center font-bold text-success">Submitted</TableCell>
                        </TableRow>
                    )}
                    {(completedResponses ?? []).sort((a, b) => {
                        const lastNameA = a.student.name?.split(" ")[1] ?? "";
                        const lastNameB = b.student.name?.split(" ")[1] ?? "";
                        return lastNameA.localeCompare(lastNameB);
                    }).map((response) => (
                        <TableRow key={response.id}>
                            <TableCell
                                className="hover:cursor-pointer hover:text-accent"
                                onClick={() => router.push(`/classroom/${classId}/${teacherId}/single-prompt-session/${promptSessionId}/single-response/${response.id}`)}
                            >
                                <ClipboardCheckIcon />
                            </TableCell>
                            <TableCell className="font-medium">
                                {response.student.name}
                            </TableCell>
                            <TableCell>{responseScore(response.response as unknown as ResponseData[])}</TableCell>
                            <TableCell>{responsePercentage(response.response as unknown as ResponseData[])}</TableCell>
                            <TableCell>{formatDateShort(response.submittedAt)}</TableCell>
                        </TableRow>
                    ))}

                    {/* INCOMPLETE ASSIGNMENTS */}
                    {incompleteResponses.length > 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center font-bold text-destructive">Not Submitted</TableCell>
                        </TableRow>
                    )}
                    {(incompleteResponses ?? []).sort((a, b) => {
                        const lastNameA = a.student.name?.split(" ")[1] ?? "";
                        const lastNameB = b.student.name?.split(" ")[1] ?? "";
                        return lastNameA.localeCompare(lastNameB);
                    }).map((response) => (
                        <TableRow key={response.id}>
                            <TableCell
                                className="hover:cursor-pointer hover:text-accent"
                                onClick={() => router.push(`/classroom/${classId}/${teacherId}/single-prompt-session/${promptSessionId}/single-response/${response.id}`)}
                            >
                                <ClipboardCheckIcon />
                            </TableCell>
                            <TableCell className="font-medium">
                                {response.student.name}
                            </TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                        </TableRow>
                    ))}

                    {/* RETURNED ASSIGNMENTS */}
                    {returnedResponses.length > 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center font-bold text-warning">Returned</TableCell>
                        </TableRow>
                    )}
                    {(returnedResponses ?? []).sort((a, b) => {
                        const lastNameA = a.student.name?.split(" ")[1] ?? "";
                        const lastNameB = b.student.name?.split(" ")[1] ?? "";
                        return lastNameA.localeCompare(lastNameB);
                    }).map((response) => (
                        <TableRow key={response.id}>
                            <TableCell
                                className="hover:cursor-pointer hover:text-accent"
                                onClick={() => router.push(`/classroom/${classId}/${teacherId}/single-prompt-session/${promptSessionId}/single-response/${response.id}`)}
                            >
                                <ClipboardCheckIcon />
                            </TableCell>
                            <TableCell className="font-medium">
                                {response.student.name}
                            </TableCell>
                            <TableCell>{responseScore(response.response as unknown as ResponseData[])}</TableCell>
                            <TableCell>{responsePercentage(response.response as unknown as ResponseData[])}</TableCell>
                            <TableCell>{formatDateShort(response.submittedAt)}</TableCell>
                        </TableRow>
                    ))}
                    {notAssigned.length > 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center font-bold text-border">Not Assigned</TableCell>
                        </TableRow>
                    )}
                    {notAssigned?.length > 0 && notAssigned.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <Button variant={'secondary'} onClick={() => createStudentResponseHandler(user.id)}>
                                    {isLoading ? (
                                        '...'
                                    ) : (
                                        'Assign'
                                    )}
                                </Button>
                            </TableCell>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

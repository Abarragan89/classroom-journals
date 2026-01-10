'use client'
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { approveUsernameChange, declineStudentRequest, approveNewPrompt, markAllRequestsAsViewed } from '@/lib/actions/student-request';
import { StudentRequest } from '@/types';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export default function StudentRequestSection({
    teacherId,
    studentRequests,
    classId
}: {
    teacherId: string;
    studentRequests: StudentRequest[];
    classId: string
}) {


    const queryClient = useQueryClient();
    const [allRequests, setAllRequests] = useState<StudentRequest[]>(studentRequests);

    // Mark all requests as viewed on component mount
    useEffect(() => {
        if (studentRequests.length > 0) {
            markAllRequestsAsViewed(teacherId, classId);
        }
    }, []); // Empty dependency array - only run once on mount

    async function approveRequest(studentId: string, requestText: string, responseId: string, requestType: string) {
        try {
            if (requestType === 'USERNAME') {
                const response = await approveUsernameChange(studentId, requestText, responseId, teacherId)
                if (!response) {
                    throw new Error("error approving new username")
                }
                setAllRequests(prev => prev.filter(request => request.id !== responseId))
                toast('Username Approved');
            } else {
                const response = await approveNewPrompt(teacherId, requestText, responseId)
                if (!response) {
                    throw new Error("error approving new username")
                }
                setAllRequests(prev => prev.filter(request => request.id !== responseId))
                toast('Prompt added to Library');
            }
            // Decrement request count in cache
            queryClient.setQueryData(['getStudentRequestCount', teacherId], (old: number | undefined) => {
                return old ? Math.max(0, old - 1) : 0;
            });
        } catch (error) {
            console.log('error approving student request', error)
        }
    }

    async function declineRequest(responseId: string) {
        try {
            const response = await declineStudentRequest(responseId, teacherId)
            if (!response) {
                throw new Error("error approving new username")
            }
            setAllRequests(prev => prev.filter(request => request.id !== responseId))
            toast.error('Request Denied!', {
                style: { background: 'hsl(0 84.2% 60.2%)', color: 'white' }
            });
            // Decrement request count in cache
            queryClient.setQueryData(['getStudentRequestCount', teacherId], (old: number | undefined) => {
                return old ? Math.max(0, old - 1) : 0;
            });
        } catch (error) {
            console.log('error denying username change ', error)
        }
    }

    return (
        <section className='space-y-10 mt-10'>
            {allRequests.length > 0 ? (
                allRequests.map((studentRequest: StudentRequest) => (
                    <Card
                        key={studentRequest.id}
                        className='bg-card'
                    >
                        <CardContent>
                            <p className='text-md tracking-wider text-center mb-5'><span className="font-bold">{studentRequest.student.username}</span> is requesting a <span className="underline">{studentRequest.type}</span> :</p>
                            {studentRequest.type === 'USERNAME' ? (
                                <p className='text-center bg-background border border-border p-4 rounded-md mx-5 sm:mx-20'>{studentRequest.displayText}</p>
                            ) : (
                                <p className='text-center bg-background border border-border p-4 rounded-md mx-5 sm:mx-20'>{studentRequest.text}</p>
                            )}
                        </CardContent>
                        <CardFooter className='flex-center gap-x-10'>
                            <Button onClick={() => approveRequest(studentRequest.studentId, studentRequest.text, studentRequest.id, studentRequest.type)} className='bg-success'>Accept</Button>
                            <Button onClick={() => declineRequest(studentRequest.id)} className='bg-destructive'>Decline</Button>
                            {/* <p>{formatDateMonthDayYear(studentRequest.createdAt)}</p> */}
                        </CardFooter>
                    </Card>
                ))
            ) : (
                <p className="text-2xl italic text-center">No Requests</p>
            )}
        </section>
    )
}

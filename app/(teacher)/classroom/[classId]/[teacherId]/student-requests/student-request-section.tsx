'use client'
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { approveUsernameChange, declineUsernameChange } from '@/lib/actions/student-request';
import { StudentRequest } from '@/types';
import { toast } from 'sonner';

export default function StudentRequestSection({
    teacherId,
    studentRequests,
}: {
    teacherId: string;
    studentRequests: StudentRequest[]
}) {

    const [allRequests, setAllRequests] = useState<StudentRequest[]>(studentRequests)

    async function approveUsername(studentId: string, username: string, responseId: string) {
        try {
            const response = await approveUsernameChange(studentId, username, responseId)
            if (!response) {
                throw new Error("error approving new username")
            }
            setAllRequests(prev => prev.filter(request => request.id !== responseId))
            toast('Username Approved');
        } catch (error) {
            console.log('error approving username change ', error)
        }
    }
    async function declineUsername(responseId: string) {
        try {
            const response = await declineUsernameChange(responseId)
            if (!response) {
                throw new Error("error approving new username")
            }
            setAllRequests(prev => prev.filter(request => request.id !== responseId))
            toast.error('Request Denied!', {
                style: { background: 'hsl(0 84.2% 60.2%)', color: 'white' }
            });
        } catch (error) {
            console.log('error denying username change ', error)
        }
    }

    return (
        <section className='flex flex-wrap gap-10 mt-10'>
            {allRequests.length > 0 ? (
                allRequests.map((studentRequest: StudentRequest) => (
                    <Card
                        key={studentRequest.id}
                        className='bg-card'
                    >
                        <CardContent>
                            <p className='font-bold text-md mb-5'>{studentRequest.student.username} is requesting a {studentRequest.type}:</p>
                            <p className='text-center bg-background border border-border px-4 py-2 rounded-lg mx-auto'>{studentRequest.text}</p>
                        </CardContent>
                        <CardFooter className='flex-center gap-x-10'>
                            <Button onClick={() => approveUsername(studentRequest.studentId, studentRequest.text, studentRequest.id)} className='bg-success'>Accept</Button>
                            <Button onClick={() => declineUsername(studentRequest.id)} className='bg-destructive'>Decline</Button>
                            {/* <p>{formatDateMonthDayYear(studentRequest.createdAt)}</p> */}
                        </CardFooter>
                    </Card>
                ))
            ) : (
                <p className="text-2xl">No Requests</p>
            )}
        </section>
    )
}

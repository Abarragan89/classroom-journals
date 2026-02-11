'use client'
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { approveUsernameChange, declineStudentRequest, approveNewPrompt, markAllRequestsAsViewed } from '@/lib/actions/student-request';
import { StudentRequest } from '@/types';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import TutorialMessageVideo from '@/components/tutorial-message-video';

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
    }, [studen]); // Empty dependency array - only run once on mount

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
            console.error('error approving student request', error)
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
            console.error('error denying username change ', error)
        }
    }

    return (
        <section className='mt-10 grid grid-cols-1 xl:grid-cols-2 gap-6'>
            {allRequests.length > 0 ? (
                allRequests.map((studentRequest: StudentRequest) => (
                    <Card key={studentRequest.id} className="bg-card shadow-lg rounded-xl border border-border mx-auto my-6 w-full">
                        <CardHeader className="">
                            <div className="flex-between">
                                <Badge
                                    variant={studentRequest.type === "PROMPT" ? "default" : "secondary"}
                                    className="font-bold text-xs"
                                >
                                    {studentRequest.type === "USERNAME" ? "Name Change" : "Prompt Idea"}
                                </Badge>
                                <p className='text-card-foreground text-sm font-bold'>{studentRequest.student.username}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-3">
                            <div className="bg-background border border-border rounded-md p-3 text-center text-md font-medium">
                                {studentRequest.type === "USERNAME"
                                    ? studentRequest.displayText
                                    : studentRequest.text}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-center gap-6 px-6 pb-6">
                            <Button
                                size={"sm"}
                                className='bg-success text-success-foreground'
                                onClick={() => approveRequest(studentRequest.studentId, studentRequest.text, studentRequest.id, studentRequest.type)}
                                aria-label="Accept Request"
                            >
                                Accept
                            </Button>
                            <Button
                                size={"sm"}
                                variant="destructive"
                                onClick={() => declineRequest(studentRequest.id)}
                                aria-label="Decline Request"
                            >
                                Decline
                            </Button>
                        </CardFooter>
                    </Card >

                ))
            ) : (
                <TutorialMessageVideo
                    title="No Student Requests"
                    subtitle="Students can submit requests for name changes or new prompts. Approved requests will show up in your class roster or prompt library!"
                    CTAButton={() => <div></div>}
                    youtubeId="YPkOROXrt3Q"
                />
            )
            }
        </section >
    )
}

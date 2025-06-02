"use client";
import RequestNewUsername from '@/components/modalBtns/request-new-username';
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getStudentRequests } from '@/lib/actions/student.dashboard.actions';
import { StudentRequest, User } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import ChangeAvatar from '@/components/shared/change-avatar';

export default function StudentProfileClientWrapper({
    studentInfo,
    studentRequests,
    classId,
    teacherId,
}: {
    studentInfo: User;
    studentRequests: StudentRequest[];
    classId: string;
    teacherId: string;
}) {

    // Get the student requests
    const { data: studentRequestData } = useQuery({
        queryKey: ['getStudentUsernameRequests', classId],
        queryFn: async () => {
            const requests = await getStudentRequests(studentInfo?.id) as unknown as StudentRequest[]
            setHasSentUsernameRequest(requests?.some(req => req.type === 'username'))
            return requests
        },
        initialData: studentRequests,
        // refetchOnMount: false,
        // refetchOnReconnect: false,
        // refetchOnWindowFocus: false,
        // staleTime: Infinity,
    })

    const [hasSentUsernameRequest, setHasSentUsernameRequest] = useState<boolean>(studentRequestData?.some(req => req.type === 'prompt'))

    function handleRequestUIHandler() {
        setHasSentUsernameRequest(true)
    }

    return (
        <section className="mt-8">
            <h3 className="h3-bold mb-1">Student Information</h3>
            <div className="space-y-5">
                <ChangeAvatar
                    userId={studentInfo?.id}
                    avatarSrc={studentInfo?.avatarURL as string}
                />
            </div>
            <div className="md:flex-between space-y-5 md:space-y-0">
                <div className="w-full md:mr-3 min-w-[275px]">
                    <Label>Name</Label>
                    <Input
                        defaultValue={studentInfo?.name}
                        readOnly
                        disabled
                    />
                </div>
                <div className="w-full md:ml-3 min-w-[275px] relative">
                    <Label>Username</Label>
                    <Input
                        defaultValue={studentInfo?.username}
                        readOnly
                        disabled
                    />
                    <RequestNewUsername
                        studentId={studentInfo?.id}
                        teacherId={teacherId}
                        handleUIChange={handleRequestUIHandler}
                        hasSentUsernameRequest={hasSentUsernameRequest}
                        classId={classId}
                    />
                </div>
            </div>
        </section>
    )
}

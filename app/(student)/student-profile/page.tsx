import { auth } from '@/auth'
import Header from '@/components/shared/header'
import { getSingleStudentInformation } from '@/lib/server/roster'
import { Session, StudentRequest, User, Response } from '@/types'
import { notFound } from 'next/navigation'
import React from 'react'
import StudentProfileClientWrapper from './student-profile-client-wrapper'
import { getStudentRequests } from '@/lib/server/student-dashboard'
import { getSingleStudentResponses } from '@/lib/server/responses'
import MyWorkClientWrapper from './my-work-client-wrapper'
import { Separator } from '@/components/ui/separator'


export default async function StudentProfile() {

    const session = await auth() as Session

    if (!session) return notFound()

    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'STUDENT' || !studentId) {
        return notFound()
    }

    const classId = session?.classroomId as string
    const teacherId = session?.teacherId as string

    console.log('classId', classId, 'teacherId', teacherId)

    if (!classId) return notFound()

    // 🔥 FIX: Use Promise.all and handle data properly
    const [
        studentData,
        studentRequests,
        studentResponses
    ] = await Promise.all([
        getSingleStudentInformation(studentId, classId),
        getStudentRequests(studentId),
        getSingleStudentResponses(studentId)
    ]);

    const studentInfo = studentData.studentInfo as unknown as User;

    // 🔥 FIX: Add safety checks
    if (!studentInfo || !studentRequests || !studentResponses) {
        console.error('Missing data:', { studentInfo, studentRequests, studentResponses });
        return notFound();
    }


    return (
        <>
            <Header session={session} studentId={studentId} />
            <main className="wrapper">
                <div suppressHydrationWarning>
                    <StudentProfileClientWrapper
                        studentInfo={studentInfo}
                        studentRequests={studentRequests as unknown as StudentRequest[]}
                        classId={classId}
                        teacherId={teacherId}
                    />
                </div>
                <Separator className='mt-10 mb-9' />
                <h2 className='h3-bold'>My Work</h2>
                <MyWorkClientWrapper
                    studentResponses={studentResponses as unknown as Response[]}
                    studentId={studentId}

                />
            </main>
        </>
    )
}

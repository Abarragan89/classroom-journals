import { auth } from '@/auth'
import Header from '@/components/shared/header'
import { getSingleStudentInformation } from '@/lib/actions/roster.action'
import { Session, StudentRequest, User } from '@/types'
import { notFound } from 'next/navigation'
import React from 'react'
import StudentProfileClientWrapper from './student-profile-client-wrapper'
import { getStudentRequests } from '@/lib/actions/student.dashboard.actions'

export default async function StudentProfile() {

    const session = await auth() as Session

    if (!session) return notFound()

    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'STUDENT' || !studentId) {
        return notFound()
    }

    const classId = session?.classroomId
    if (!classId) return notFound()

    const studentData = await getSingleStudentInformation(studentId, classId)
    const studentInfo = studentData.data as unknown as User


    const studentRequests = await getStudentRequests(studentInfo?.id) as unknown as StudentRequest[]
    const teacherId = studentData.teacherId as unknown as string

    return (
        <>
            <Header session={session} studentId={studentId} />
            <main className="wrapper">
                <StudentProfileClientWrapper
                    studentInfo={studentInfo}
                    studentRequests={studentRequests}
                    classId={classId}
                    teacherId={teacherId}
                />
            </main>
        </>
    )
}

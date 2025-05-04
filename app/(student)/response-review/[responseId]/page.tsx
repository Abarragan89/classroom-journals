import { auth } from '@/auth'
import Header from '@/components/shared/header'
import { getSingleResponseForReview } from '@/lib/actions/response.action'
import { Response, ResponseData, Session } from '@/types'
import { notFound } from 'next/navigation'
import React from 'react'
import SingleQuestionReview from './single-question-review'
import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'
import ReviewWrapper from './review-wrapper'
import { getClassroomGrade, getTeacherId } from '@/lib/actions/student.dashboard.actions'
import { determineSubscriptionAllowance } from '@/lib/actions/profile.action'

export default async function ResponseReview({
    params
}: {
    params: Promise<{ responseId: string }>
}) {

    const session = await auth() as Session

    if (!session) notFound()

    const classroomId = session?.classroomId

    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'student' || !studentId) {
        notFound()
    }

    const { responseId } = await params

    const singleResponse = await getSingleResponseForReview(responseId) as unknown as Response

    const teacherId = await getTeacherId(classroomId as string)

    const { isSubscriptionActive } = await determineSubscriptionAllowance(teacherId as string)
    const grade = await getClassroomGrade(classroomId as string)

    return (
        <div>
            <Header session={session} studentId={studentId} />
            <main className="wrapper">
                <Link href='/my-work' className="flex items-center hover:underline w-fit print:hidden">
                    <ArrowLeftIcon className="mr-1" size={20} />
                    Back to My Work
                </Link>
                <h1 className="font-bold mt-2 whitespace-pre-line">
                    {singleResponse?.promptSession?.promptType === 'multi-question' && (
                        singleResponse?.promptSession?.title
                    )}
                </h1>
                {singleResponse?.promptSession?.promptType === 'multi-question' ?
                    <ReviewWrapper
                        allQuestions={singleResponse?.response as unknown as ResponseData[]}
                        isSubmittable={singleResponse?.completionStatus === 'INCOMPLETE' || singleResponse?.completionStatus === 'RETURNED'}
                        responseId={singleResponse?.id}
                        showGrades={singleResponse?.promptSession?.areGradesVisible}
                        isTeacherPremium={isSubscriptionActive as boolean}
                        gradeLevel={grade as string}
                    />
                    :
                    <SingleQuestionReview
                        questions={singleResponse?.response as unknown as ResponseData[]}
                        isSubmittable={singleResponse?.completionStatus === 'INCOMPLETE' || singleResponse?.completionStatus === 'RETURNED'}
                        responseId={singleResponse?.id}
                        showGrades={singleResponse?.promptSession?.areGradesVisible as boolean}
                        isPublic={singleResponse?.promptSession?.isPublic as boolean}
                        promptSessionId={singleResponse?.promptSession?.id as string}
                    />
                }
            </main>
        </div>
    )
}

import { auth } from '@/auth'
import Header from '@/components/shared/header'
import { Response, ResponseData, Session } from '@/types'
import { notFound } from 'next/navigation'
import React from 'react'
import SingleQuestionReview from './single-question-review'
import Link from 'next/link'
import { ArrowBigLeft } from 'lucide-react'
import ReviewWrapper from './review-wrapper'
import { determineSubscriptionAllowance } from '@/lib/server/profile'
import { getSingleResponseForReview } from '@/lib/server/responses'
import { getClassroomGrade } from '@/lib/server/student-dashboard'
import { Button } from '@/components/ui/button'

export default async function ResponseReview({
    params
}: {
    params: Promise<{ responseId: string }>
}) {

    const session = await auth() as Session

    if (!session) return notFound()


    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'STUDENT' || !studentId) {
        return notFound()
    }

    const classroomId = session?.classroomId
    const teacherId = session?.teacherId

    const { responseId } = await params

    const [singleResponse, { isPremiumTeacher }, grade] = await Promise.all([
        getSingleResponseForReview(responseId, studentId) as unknown as Response,
        determineSubscriptionAllowance(teacherId as string),
        getClassroomGrade(classroomId as string)
    ])

    return (
        <div>
            <Header session={session} studentId={studentId} />
            <main className="wrapper">
                <div className="flex-between max-w-[1000px] mx-auto">

                    {/* Header with back button and link to class discussion */}
                    <Link href='/' className="flex items-center hover:text-primary w-fit print:hidden">
                        <ArrowBigLeft className="mr-1" size={23} />
                        Back To Dashboard
                    </Link>

                    {singleResponse?.promptSession?.isPublic && singleResponse?.promptSession?.promptType === "BLOG" && (
                        <Button asChild>
                            <Link
                                href={`/discussion-board/${singleResponse?.promptSession?.id}/response/${responseId}`}
                            >
                                View Published Blogs
                            </Link>
                        </Button>
                    )}

                    {!singleResponse?.promptSession?.isPublic && singleResponse?.promptSession?.promptType === "BLOG" && (
                        <Button asChild>
                            <Link
                                href={`/discussion-board/${singleResponse?.promptSession?.id}/response/${responseId}`}
                            >
                                Blogs are Private
                            </Link>
                        </Button>
                    )}

                </div>

                {/* Assessment Title ONly because blog title may be too long */}
                {singleResponse?.promptSession?.promptType === 'ASSESSMENT' && (
                    <h2 className="h2-bold my-10 text-center">
                        {singleResponse?.promptSession?.title}
                    </h2>
                )}

                {singleResponse?.promptSession?.promptType === 'ASSESSMENT' ?
                    <ReviewWrapper
                        singleResponse={singleResponse}
                        isTeacherPremium={isPremiumTeacher as boolean}
                        gradeLevel={grade as string}
                        responseId={responseId}
                        studentId={studentId}
                    />
                    :
                    <SingleQuestionReview
                        questions={singleResponse?.response as unknown as ResponseData[]}
                        isSubmittableInitial={singleResponse?.completionStatus === 'INCOMPLETE' || singleResponse?.completionStatus === 'RETURNED'}
                        showGradesInitial={singleResponse?.promptSession?.areGradesVisible as boolean}
                        spellCheckEnabledInitial={singleResponse?.spellCheckEnabled}
                        rubricGradesInitial={singleResponse?.rubricGrades}
                        studentName={singleResponse?.student?.name}
                        responseId={singleResponse?.id}
                        studentId={studentId}
                    />
                }
            </main>
        </div>
    )
}

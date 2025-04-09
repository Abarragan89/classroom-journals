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

export default async function ResponseReview({
    params
}: {
    params: Promise<{ responseId: string }>
}) {

    const session = await auth() as Session

    if (!session) notFound()

    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'student' || !studentId) {
        notFound()
    }

    const { responseId } = await params


    const singleResponse = await getSingleResponseForReview(responseId) as unknown as Response
    const h1Heading = singleResponse?.promptSession?.promptType === 'single-question' ? 'Blog Response' : 'Assessment Response'

    return (
        <div>
            <Header session={session} studentId={studentId} />
            <main className="wrapper">
                <Link href='/my-work' className="flex items-center hover:underline w-fit print:hidden">
                    <ArrowLeftIcon className="mr-1" size={20} />
                    Back to My Work
                </Link>
                <h1 className="h2-bold mt-2 ">{singleResponse?.promptSession?.title}</h1>
                {singleResponse?.promptSession?.promptType === 'multi-question' ?
                    <ReviewWrapper
                        allQuestions={singleResponse?.response as unknown as ResponseData[]}
                        isSubmittable={singleResponse?.isSubmittable}
                        responseId={singleResponse?.id}
                        showGrades={singleResponse?.promptSession?.areGradesVisible}
                    />
                    :
                    <SingleQuestionReview
                        questions={singleResponse?.response as unknown as ResponseData[]}
                        isSubmittable={singleResponse?.isSubmittable}
                        responseId={singleResponse?.id}
                        showGrades={singleResponse?.promptSession?.areGradesVisible as boolean}
                    />
                }
            </main>
        </div>
    )
}
